import { Heart } from "lucide-react";

export interface LikedStory {
  id: string;
  title: string;
  imageUrl: string;
  likeCount: number;
}

export interface LikedStoriesGridProps {
  stories: LikedStory[];
  onStoryClick: (id: string) => void;
}

export default function LikedStoriesGrid({
  stories,
  onStoryClick,
}: LikedStoriesGridProps) {
  if (stories.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center">
        <Heart className="h-16 w-16 text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold text-foreground mb-2">
          No liked stories yet
        </h3>
        <p className="text-sm text-muted-foreground">
          Stories you like will appear here
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-4 p-4">
      {stories.map((story) => (
        <div
          key={story.id}
          className="bg-card border rounded-md overflow-hidden cursor-pointer hover-elevate active-elevate-2"
          onClick={() => onStoryClick(story.id)}
          data-testid={`card-liked-story-${story.id}`}
        >
          <div className="p-4 space-y-2">
            <h3 className="text-sm font-semibold text-foreground line-clamp-3" data-testid={`text-liked-story-title-${story.id}`}>
              {story.title}
            </h3>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Heart className="h-3 w-3 fill-current text-destructive" />
              <span data-testid={`text-liked-story-count-${story.id}`}>{story.likeCount}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
