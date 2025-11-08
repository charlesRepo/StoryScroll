import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
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
import { Loader2, Sparkles, Save } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Story } from "@shared/schema";

export interface CreateStoryFormProps {
  onGenerate: (params: {
    theme: string;
    ageRange: string;
    language: string;
    generateMoral: boolean;
  }) => void;
  generatedStory?: Partial<Story>;
  isGenerating?: boolean;
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
  generatedStory,
  isGenerating = false,
}: CreateStoryFormProps) {
  const { toast } = useToast();
  const [theme, setTheme] = useState("");
  const [generateMoral, setGenerateMoral] = useState(true);
  const [ageRange, setAgeRange] = useState("3-5 years");
  const [language, setLanguage] = useState("en");
  const [isPublic, setIsPublic] = useState(true);

  const saveStoryMutation = useMutation({
    mutationFn: async () => {
      if (!generatedStory) return;
      
      const response = await apiRequest("POST", "/api/stories", {
        title: generatedStory.title!,
        summary: generatedStory.summary!,
        moral: generatedStory.moral || null,
        fullContent: generatedStory.fullContent!,
        imageUrl: "https://images.unsplash.com/photo-1506812574058-fc75fa93fead?w=800&q=80",
        ageRange: generatedStory.ageRange!,
        language: generatedStory.language!,
        sourceType: "ai-generated",
        isPublic,
      });
      return await response.json();
    },
    onSuccess: () => {
      toast({
        title: "Story saved!",
        description: "Your custom story has been saved successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/stories"] });
      
      // Reset form
      setTheme("");
      setGenerateMoral(true);
    },
    onError: (error: any) => {
      toast({
        title: "Save failed",
        description: error.message || "Failed to save story",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = () => {
    if (theme.trim()) {
      onGenerate({ theme, ageRange, language, generateMoral });
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

      {!generatedStory ? (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="theme">Story Theme</Label>
            <Textarea
              id="theme"
              placeholder="e.g., A brave little bunny who learns to overcome their fear of the dark..."
              className="h-32 resize-none"
              value={theme}
              onChange={(e) => setTheme(e.target.value)}
              disabled={isGenerating}
              data-testid="input-story-theme"
            />
          </div>

          <div className="flex items-center justify-between p-4 border rounded-md">
            <div className="space-y-1">
              <Label htmlFor="generateMoral">Generate Moral</Label>
              <p className="text-sm text-muted-foreground">
                Let AI create a moral lesson for the story
              </p>
            </div>
            <Switch
              id="generateMoral"
              checked={generateMoral}
              onCheckedChange={setGenerateMoral}
              disabled={isGenerating}
              data-testid="switch-generate-moral"
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
                  onClick={() => !isGenerating && setAgeRange(age)}
                  data-testid={`button-create-age-${age.replace(/\s+/g, "-")}`}
                >
                  {age}
                </Badge>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="language">Language</Label>
            <Select value={language} onValueChange={setLanguage} disabled={isGenerating}>
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

          <Button
            className="w-full gap-2"
            size="lg"
            onClick={handleSubmit}
            disabled={!theme.trim() || isGenerating}
            data-testid="button-generate"
          >
            {isGenerating ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Generating Story with AI...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" />
                Generate Story with AI
              </>
            )}
          </Button>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="p-6 border rounded-lg space-y-4 bg-card">
            <h3 className="text-xl font-serif font-semibold" data-testid="text-generated-title">
              {generatedStory.title}
            </h3>
            
            {generatedStory.moral && (
              <div className="p-4 bg-primary/10 rounded-md">
                <p className="text-sm font-medium text-muted-foreground mb-1">Moral of the Story</p>
                <p className="text-sm">{generatedStory.moral}</p>
              </div>
            )}
            
            <div className="prose prose-sm max-w-none">
              <p className="text-sm text-muted-foreground italic mb-3">{generatedStory.summary}</p>
              <div className="whitespace-pre-wrap text-sm leading-relaxed">
                {generatedStory.fullContent}
              </div>
            </div>
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
              disabled={saveStoryMutation.isPending}
              data-testid="switch-public"
            />
          </div>

          <div className="flex gap-3">
            <Button
              variant="outline"
              size="lg"
              className="flex-1"
              onClick={() => {
                setTheme("");
                setGenerateMoral(true);
              }}
              disabled={saveStoryMutation.isPending}
              data-testid="button-create-another"
            >
              Create Another
            </Button>
            <Button
              size="lg"
              className="flex-1 gap-2"
              onClick={() => saveStoryMutation.mutate()}
              disabled={saveStoryMutation.isPending}
              data-testid="button-save-story"
            >
              {saveStoryMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  Save Story
                </>
              )}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
