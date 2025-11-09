import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/lib/auth";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Story } from "@shared/schema";
import StoryCard from "@/components/StoryCard";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Button } from "@/components/ui/button";
import { ChevronDown } from "lucide-react";
import { useState } from "react";

interface DismissedStoriesSectionProps {
  onStoryClick: (storyId: string) => void;
}

export default function DismissedStoriesSection({ onStoryClick }: DismissedStoriesSectionProps) {
  const { isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);

  const { data: dismissedStoriesData } = useQuery<{ stories: Story[] }>({
    queryKey: ["/api/dismissed-stories"],
    enabled: isAuthenticated,
  });

  const dismissedStories = dismissedStoriesData?.stories || [];

  const restoreMutation = useMutation({
    mutationFn: async (storyId: string) => {
      const response = await apiRequest("DELETE", `/api/dismissed-stories/${storyId}`);
      return await response.json() as { dismissed: boolean };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/dismissed-stories"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stories"] });
      toast({
        title: "Story restored",
        description: "Story has been restored to your feed",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to restore story",
        variant: "destructive",
      });
    },
  });

  if (!isAuthenticated) {
    return null;
  }

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen} className="border rounded-md">
      <CollapsibleTrigger asChild>
        <Button
          variant="ghost"
          className="w-full flex items-center justify-between p-4"
          data-testid="button-dismissed-stories-toggle"
        >
          <span className="font-semibold">Dismissed Stories ({dismissedStories.length})</span>
          <ChevronDown className={`h-5 w-5 transition-transform ${isOpen ? "rotate-180" : ""}`} />
        </Button>
      </CollapsibleTrigger>
      <CollapsibleContent className="border-t">
        {dismissedStories.length === 0 ? (
          <div className="p-6 text-center">
            <p className="text-muted-foreground">No dismissed stories</p>
            <p className="text-sm text-muted-foreground mt-1">
              Stories you dismiss will appear here
            </p>
          </div>
        ) : (
          <div className="divide-y">
            {dismissedStories.map((story) => (
              <div key={story.id} className="p-4">
                <StoryCard
                  {...story}
                  showDismissButton={false}
                  showRestoreButton={true}
                  onRestore={() => restoreMutation.mutate(story.id)}
                  onClick={() => onStoryClick(story.id)}
                />
              </div>
            ))}
          </div>
        )}
      </CollapsibleContent>
    </Collapsible>
  );
}
