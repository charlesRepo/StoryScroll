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
import { Loader2, Sparkles } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Story } from "@shared/schema";
import EditStoryForm from "./EditStoryForm";

export interface CreateStoryFormProps {
  onGenerate: (params: {
    theme: string;
    language: string;
    generateMoral: boolean;
  }) => void;
  generatedStory?: Partial<Story> | null;
  isGenerating?: boolean;
  onResetGeneratedStory: () => void;
}

const LANGUAGES = [
  { value: "en", label: "English" },
  { value: "fr", label: "French" },
  { value: "de", label: "German" },
];

export default function CreateStoryForm({
  onGenerate,
  generatedStory,
  isGenerating = false,
  onResetGeneratedStory,
}: CreateStoryFormProps) {
  const { toast } = useToast();
  const [theme, setTheme] = useState("");
  const [generateMoral, setGenerateMoral] = useState(true);
  const [language, setLanguage] = useState("en");

  const publishStoryMutation = useMutation({
    mutationFn: async (storyData: {
      title: string;
      summary: string;
      moral: string;
      fullContent: string;
      isPublic: boolean;
    }) => {
      if (!generatedStory) return;
      
      const response = await apiRequest("POST", "/api/stories", {
        title: storyData.title,
        summary: storyData.summary,
        moral: storyData.moral || null,
        fullContent: storyData.fullContent,
        imageUrl: "https://images.unsplash.com/photo-1506812574058-fc75fa93fead?w=800&q=80",
        language: generatedStory.language!,
        sourceType: "user-shared",
        isPublic: storyData.isPublic,
      });
      return await response.json();
    },
    onSuccess: () => {
      toast({
        title: "Story published!",
        description: "Your custom story has been published successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/stories"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stories/mine"] });
      
      // Reset form and close editing screen
      setTheme("");
      setGenerateMoral(true);
      onResetGeneratedStory();
    },
    onError: (error: any) => {
      toast({
        title: "Publish failed",
        description: error.message || "Failed to publish story",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = () => {
    if (theme.trim()) {
      onGenerate({ theme, language, generateMoral });
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
        <EditStoryForm
          initialTitle={generatedStory.title || ""}
          initialSummary={generatedStory.summary || ""}
          initialMoral={generatedStory.moral || ""}
          initialContent={generatedStory.fullContent || ""}
          onPublish={(storyData) => publishStoryMutation.mutate(storyData)}
          onCancel={() => {
            setTheme("");
            setGenerateMoral(true);
            onResetGeneratedStory();
          }}
          isPublishing={publishStoryMutation.isPending}
        />
      )}
    </div>
  );
}
