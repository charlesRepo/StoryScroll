import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card } from "@/components/ui/card";

export interface EditStoryFormProps {
  initialTitle: string;
  initialSummary: string;
  initialMoral: string;
  initialContent: string;
  onPublish: (story: {
    title: string;
    summary: string;
    moral: string;
    fullContent: string;
    isPublic: boolean;
  }) => void;
  onCancel: () => void;
  isPublishing: boolean;
}

export default function EditStoryForm({
  initialTitle,
  initialSummary,
  initialMoral,
  initialContent,
  onPublish,
  onCancel,
  isPublishing,
}: EditStoryFormProps) {
  const [title, setTitle] = useState(initialTitle);
  const [summary, setSummary] = useState(initialSummary);
  const [moral, setMoral] = useState(initialMoral);
  const [fullContent, setFullContent] = useState(initialContent);
  const [isPublic, setIsPublic] = useState(true);

  const handlePublish = () => {
    onPublish({
      title,
      summary,
      moral,
      fullContent,
      isPublic,
    });
  };

  return (
    <div className="space-y-6 pb-20">
      <div>
        <h2 className="text-2xl font-semibold mb-2">Edit Your Story</h2>
        <p className="text-muted-foreground">
          Review and edit your generated story before publishing
        </p>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="title">Title</Label>
          <Input
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Story title"
            data-testid="input-edit-title"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="summary">Summary</Label>
          <Textarea
            id="summary"
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
            placeholder="Brief summary (max 70 words)"
            rows={3}
            data-testid="input-edit-summary"
          />
          <p className="text-xs text-muted-foreground">
            {summary.split(/\s+/).filter(Boolean).length} / 70 words
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="moral">Moral (Optional)</Label>
          <Textarea
            id="moral"
            value={moral}
            onChange={(e) => setMoral(e.target.value)}
            placeholder="Moral of the story"
            rows={2}
            data-testid="input-edit-moral"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="content">Full Story</Label>
          <Textarea
            id="content"
            value={fullContent}
            onChange={(e) => setFullContent(e.target.value)}
            placeholder="Full story content"
            rows={12}
            className="font-serif"
            data-testid="input-edit-content"
          />
          <p className="text-xs text-muted-foreground">
            {fullContent.split(/\s+/).filter(Boolean).length} words
          </p>
        </div>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label htmlFor="public-toggle" className="text-base">
                Share Publicly
              </Label>
              <p className="text-sm text-muted-foreground">
                Make this story visible to everyone in the feed and search
              </p>
            </div>
            <Switch
              id="public-toggle"
              checked={isPublic}
              onCheckedChange={setIsPublic}
              data-testid="switch-public"
            />
          </div>
        </Card>
      </div>

      <div className="flex gap-3">
        <Button
          onClick={handlePublish}
          disabled={isPublishing || !title.trim() || !fullContent.trim()}
          className="flex-1"
          data-testid="button-publish"
        >
          {isPublishing ? "Publishing..." : "Publish Story"}
        </Button>
        <Button
          onClick={onCancel}
          variant="outline"
          disabled={isPublishing}
          data-testid="button-cancel-edit"
        >
          Cancel
        </Button>
      </div>
    </div>
  );
}
