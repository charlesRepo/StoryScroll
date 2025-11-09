import { Heart, Book, Globe, User, Clock, X, ArrowUpLeft, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export interface StoryCardProps {
  id: string;
  title: string;
  summary: string;
  moral?: string;
  fullContent?: string;
  imageUrl: string;
  ageRange: string;
  language: string;
  isTranslated?: boolean;
  originalLanguage?: string;
  sourceType: "classic" | "user-shared";
  authorName?: string;
  likeCount?: number;
  isLiked?: boolean;
  isDismissed?: boolean;
  onLike?: () => void;
  onDismiss?: () => void;
  onRestore?: () => void;
  onClick?: () => void;
  showDismissButton?: boolean;
  showRestoreButton?: boolean;
  isDismissPending?: boolean;
}

// Calculate reading time based on word count (assuming 200 words per minute for reading aloud to children)
function calculateReadingTime(text: string): number {
  const wordsPerMinute = 200;
  const wordCount = text.trim().split(/\s+/).length;
  const minutes = Math.ceil(wordCount / wordsPerMinute);
  return Math.max(1, minutes); // Minimum 1 minute
}

export default function StoryCard({
  title,
  summary,
  moral,
  fullContent,
  imageUrl,
  ageRange,
  language,
  isTranslated,
  originalLanguage,
  sourceType,
  authorName,
  likeCount = 0,
  isLiked = false,
  isDismissed = false,
  onLike,
  onDismiss,
  onRestore,
  onClick,
  isDismissPending = false,
  showDismissButton = true,
  showRestoreButton = false,
}: StoryCardProps) {
  const readingTime = fullContent ? calculateReadingTime(fullContent) : null;

  return (
    <div
      className="min-h-full w-full flex flex-col bg-background snap-start cursor-pointer"
      onClick={onClick}
      data-testid="card-story"
    >
      <div className="relative overflow-hidden" style={{ height: '30vh' }}>
        <img
          src={imageUrl}
          alt={title}
          className="w-full h-full object-cover"
          data-testid="img-story-cover"
        />
      </div>

      <div className="flex-1 p-6 space-y-4 overflow-y-auto">
        <div className="flex items-start justify-between gap-4">
          <h2 className="text-2xl font-serif font-semibold text-foreground leading-tight flex-1" data-testid="text-story-title">
            {title}
          </h2>
          <div className="flex gap-1">
            {showRestoreButton && onRestore && (
              <Button
                size="icon"
                variant="ghost"
                onClick={(e) => {
                  e.stopPropagation();
                  onRestore();
                }}
                data-testid="button-restore"
              >
                <ArrowUpLeft className="h-5 w-5" />
              </Button>
            )}
            {showDismissButton && (
              <Button
                size="icon"
                variant="ghost"
                onClick={(e) => {
                  e.stopPropagation();
                  onDismiss?.();
                }}
                disabled={isDismissPending}
                className="no-default-hover-elevate"
                data-testid="button-dismiss"
              >
                {isDismissPending ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <X className="h-5 w-5" />
                )}
              </Button>
            )}
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
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {readingTime && (
            <>
              <div className="flex items-center gap-1 text-sm text-muted-foreground" data-testid="text-reading-time">
                <Clock className="h-3 w-3" />
                {readingTime} min
              </div>
              <span className="text-muted-foreground">|</span>
            </>
          )}
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

        {moral && (
          <div className="pt-2 border-t" data-testid="section-moral">
            <p className="text-sm text-muted-foreground italic">
              <span className="font-semibold not-italic">Moral:</span> {moral}
            </p>
          </div>
        )}

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
