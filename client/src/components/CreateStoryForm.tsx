import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2 } from "lucide-react";

export interface CreateStoryFormProps {
  onGenerate: (params: {
    description: string;
    ageRange: string;
    language: string;
    isPublic: boolean;
  }) => void;
  isLoading?: boolean;
}

const AGE_RANGES = ["0-2 years", "3-5 years", "6-10 years"];
const LANGUAGES = [
  { value: "en", label: "English" },
  { value: "fr", label: "French" },
  { value: "es", label: "Spanish" },
  { value: "de", label: "German" },
];

export default function CreateStoryForm({
  onGenerate,
  isLoading = false,
}: CreateStoryFormProps) {
  const [description, setDescription] = useState("");
  const [ageRange, setAgeRange] = useState("3-5 years");
  const [language, setLanguage] = useState("en");
  const [isPublic, setIsPublic] = useState(false);

  const handleSubmit = () => {
    if (description.trim()) {
      onGenerate({ description, ageRange, language, isPublic });
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-2xl mx-auto">
      <div className="space-y-2">
        <h2 className="text-2xl font-semibold text-foreground" data-testid="text-create-title">
          Create a Custom Story
        </h2>
        <p className="text-sm text-muted-foreground">
          Describe the story you'd like to create for your child
        </p>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="description">Story Description</Label>
          <Textarea
            id="description"
            placeholder="e.g., A brave little bunny who learns to overcome their fear of the dark..."
            className="h-32 resize-none"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            disabled={isLoading}
            data-testid="input-story-description"
          />
        </div>

        <div className="space-y-2">
          <Label>Age Range</Label>
          <div className="flex flex-wrap gap-2">
            {AGE_RANGES.map((age) => (
              <Badge
                key={age}
                variant={ageRange === age ? "default" : "outline"}
                className="cursor-pointer hover-elevate active-elevate-2"
                onClick={() => !isLoading && setAgeRange(age)}
                data-testid={`button-create-age-${age.replace(/\s+/g, "-")}`}
              >
                {age}
              </Badge>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="language">Language</Label>
          <Select value={language} onValueChange={setLanguage} disabled={isLoading}>
            <SelectTrigger id="language" data-testid="select-create-language">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {LANGUAGES.map((lang) => (
                <SelectItem key={lang.value} value={lang.value}>
                  {lang.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center justify-between p-4 border rounded-md">
          <div className="space-y-1">
            <Label htmlFor="public">Share Publicly</Label>
            <p className="text-sm text-muted-foreground">
              Allow other parents to discover this story
            </p>
          </div>
          <Switch
            id="public"
            checked={isPublic}
            onCheckedChange={setIsPublic}
            disabled={isLoading}
            data-testid="switch-public"
          />
        </div>

        <Button
          className="w-full"
          size="lg"
          onClick={handleSubmit}
          disabled={!description.trim() || isLoading}
          data-testid="button-generate"
        >
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Generating Story...
            </>
          ) : (
            "Generate Story"
          )}
        </Button>
      </div>
    </div>
  );
}
