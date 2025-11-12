import { useQuery, useMutation } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Trash2, Edit, Eye, EyeOff, Book } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Story } from "@shared/schema";

export interface MyStoriesSectionProps {
  onStoryClick: (storyId: string) => void;
}

export default function MyStoriesSection({ onStoryClick }: MyStoriesSectionProps) {
  const { toast } = useToast();

  const { data, isLoading } = useQuery<{ stories: Story[] }>({
    queryKey: ["/api/stories/mine"],
  });

  const deleteStoryMutation = useMutation({
    mutationFn: async (storyId: string) => {
      await apiRequest("DELETE", `/api/stories/${storyId}`);
    },
    onSuccess: () => {
      toast({
        title: "Story deleted",
        description: "Your story has been removed successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/stories/mine"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stories"] });
    },
    onError: (error: any) => {
      toast({
        title: "Delete failed",
        description: error.message || "Failed to delete story",
        variant: "destructive",
      });
    },
  });

  const stories = data?.stories || [];

  if (isLoading) {
    return (
      <div className="space-y-3">
        <h3 className="text-lg font-semibold text-foreground">My Published Stories</h3>
        <div className="text-sm text-muted-foreground">Loading your stories...</div>
      </div>
    );
  }

  if (stories.length === 0) {
    return (
      <div className="space-y-3">
        <h3 className="text-lg font-semibold text-foreground">My Published Stories</h3>
        <Card className="p-6 text-center">
          <Book className="h-12 w-12 mx-auto mb-3 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">
            You haven't published any stories yet.
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Create a story to get started!
          </p>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <h3 className="text-lg font-semibold text-foreground" data-testid="text-my-stories-heading">
        My Published Stories ({stories.length})
      </h3>
      <div className="space-y-3 max-h-96 overflow-y-auto">
        {stories.map((story) => (
          <Card
            key={story.id}
            className="p-4 space-y-3 hover-elevate cursor-pointer"
            data-testid={`card-my-story-${story.id}`}
          >
            <div onClick={() => onStoryClick(story.id)}>
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <h4 className="font-serif font-semibold text-base line-clamp-2 mb-2" data-testid="text-my-story-title">
                    {story.title}
                  </h4>
                  <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                    {story.summary}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <Badge variant="secondary" className="text-xs">
                  {story.language}
                </Badge>
                {story.isPublic ? (
                  <Badge variant="default" className="text-xs gap-1">
                    <Eye className="h-3 w-3" />
                    Public
                  </Badge>
                ) : (
                  <Badge variant="outline" className="text-xs gap-1">
                    <EyeOff className="h-3 w-3" />
                    Private
                  </Badge>
                )}
                {story.likeCount && story.likeCount > 0 && (
                  <span className="text-xs text-muted-foreground">
                    {story.likeCount} {story.likeCount === 1 ? "like" : "likes"}
                  </span>
                )}
              </div>
            </div>

            <div className="flex gap-2 pt-2 border-t">
              <Button
                size="sm"
                variant="outline"
                className="flex-1 gap-2"
                onClick={(e) => {
                  e.stopPropagation();
                  onStoryClick(story.id);
                }}
                data-testid="button-view-story"
              >
                <Edit className="h-3 w-3" />
                View
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="gap-2 text-destructive hover:bg-destructive/10"
                onClick={(e) => {
                  e.stopPropagation();
                  if (confirm("Are you sure you want to delete this story? This action cannot be undone.")) {
                    deleteStoryMutation.mutate(story.id);
                  }
                }}
                disabled={deleteStoryMutation.isPending}
                data-testid="button-delete-story"
              >
                <Trash2 className="h-3 w-3" />
                Delete
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
