import { Heart, Book, Globe, User } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export interface StoryCardProps {
  id: string;
  title: string;
  summary: string;
  imageUrl: string;
  ageRange: string;
  language: string;
  isTranslated?: boolean;
  originalLanguage?: string;
  sourceType: "classic" | "user-shared";
  authorName?: string;
  likeCount?: number;
  isLiked?: boolean;
  onLike?: () => void;
  onClick?: () => void;
}

export default function StoryCard({
  title,
  summary,
  imageUrl,
  ageRange,
  language,
  isTranslated,
  originalLanguage,
  sourceType,
  authorName,
  likeCount = 0,
  isLiked = false,
  onLike,
  onClick,
}: StoryCardProps) {
  return (
    <div
      className="h-screen w-full flex flex-col bg-background snap-start cursor-pointer"
      onClick={onClick}
      data-testid="card-story"
    >
      <div className="h-1/2 relative overflow-hidden">
        <img
          src={imageUrl}
          alt={title}
          className="w-full h-full object-cover"
          data-testid="img-story-cover"
        />
      </div>

      <div className="h-1/2 p-6 space-y-4 overflow-y-auto">
        <div className="flex items-start justify-between gap-4">
          <h2 className="text-2xl font-serif font-semibold text-foreground leading-tight flex-1" data-testid="text-story-title">
            {title}
          </h2>
          <Button
            size="icon"
            variant="ghost"
            className={isLiked ? "text-destructive" : ""}
            onClick={(e) => {
              e.stopPropagation();
              onLike?.();
            }}
            data-testid="button-like"
          >
            <Heart className={`h-5 w-5 ${isLiked ? "fill-current" : ""}`} />
          </Button>
        </div>

        <div className="flex flex-wrap gap-2">
          <Badge variant="secondary" data-testid="badge-age">
            {ageRange}
          </Badge>
          <Badge variant="secondary" data-testid="badge-language">
            {language}
          </Badge>
          {isTranslated && originalLanguage && (
            <Badge variant="outline" className="gap-1" data-testid="badge-translated">
              <Globe className="h-3 w-3" />
              Translated from {originalLanguage}
            </Badge>
          )}
        </div>

        <p className="text-base text-foreground leading-relaxed" data-testid="text-story-summary">
          {summary}
        </p>

        <div className="flex items-center justify-between text-sm text-muted-foreground pt-2">
          {sourceType === "classic" ? (
            <div className="flex items-center gap-1" data-testid="text-source-classic">
              <Book className="h-4 w-4" />
              <span>Classic Story</span>
            </div>
          ) : (
            <div className="flex items-center gap-1" data-testid="text-source-user">
              <User className="h-4 w-4" />
              <span>Shared by {authorName}</span>
            </div>
          )}
          {likeCount > 0 && (
            <span className="text-muted-foreground" data-testid="text-like-count">
              {likeCount} {likeCount === 1 ? "like" : "likes"}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
