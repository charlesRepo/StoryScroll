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
      className="min-h-full w-full flex items-center justify-center snap-start p-6"
      data-testid="card-story"
    >
      <div 
        className="bg-[#faf8f5] rounded-lg shadow-lg p-8 max-w-2xl w-full space-y-4 border border-gray-200/50 cursor-pointer"
        onClick={onClick}
      >
        <div className="flex justify-end gap-1 mb-2">
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

        <h2 className="font-serif font-bold text-gray-900 leading-tight w-full" style={{ fontSize: '32px' }} data-testid="text-story-title">
          {title}
        </h2>

        <div className="flex flex-wrap items-center gap-2">
          {readingTime && (
            <>
              <div className="flex items-center gap-1 text-sm text-gray-600" data-testid="text-reading-time">
                <Clock className="h-3 w-3" />
                {readingTime} min
              </div>
              <span className="text-gray-400">|</span>
            </>
          )}
          <Badge variant="secondary" data-testid="badge-language">
            {language}
          </Badge>
        </div>

        <p className="text-lg text-gray-700 leading-relaxed" data-testid="text-story-summary">
          {summary}
        </p>

        {moral && (
          <div className="pt-2 border-t border-gray-300" data-testid="section-moral">
            <p className="text-sm text-gray-600 italic">
              <span className="font-semibold not-italic">Moral:</span> {moral}
            </p>
          </div>
        )}

        <div className="flex items-center justify-between text-sm text-gray-600 pt-2">
          {authorName && (
            <div className="flex items-center gap-1" data-testid="text-author">
              <Book className="h-4 w-4" />
              <span>Author: {authorName}</span>
            </div>
          )}
          {likeCount > 0 && (
            <span className="text-gray-600" data-testid="text-like-count">
              {likeCount} {likeCount === 1 ? "like" : "likes"}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
