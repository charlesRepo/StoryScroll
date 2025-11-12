import { X, Heart, Book, Globe, User, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";

export interface StoryModalProps {
  title: string;
  fullContent: string;
  moral?: string;
  imageUrl: string;
  language: string;
  isTranslated?: boolean;
  originalLanguage?: string;
  sourceType: "classic" | "user-shared";
  authorName?: string;
  likeCount?: number;
  isLiked?: boolean;
  onClose: () => void;
  onLike?: () => void;
}

// Calculate reading time based on word count (assuming 200 words per minute for reading aloud to children)
function calculateReadingTime(text: string): number {
  const wordsPerMinute = 200;
  const wordCount = text.trim().split(/\s+/).length;
  const minutes = Math.ceil(wordCount / wordsPerMinute);
  return Math.max(1, minutes); // Minimum 1 minute
}

export default function StoryModal({
  title,
  fullContent,
  moral,
  imageUrl,
  language,
  isTranslated,
  originalLanguage,
  sourceType,
  authorName,
  likeCount = 0,
  isLiked = false,
  onClose,
  onLike,
}: StoryModalProps) {
  const readingTime = calculateReadingTime(fullContent);

  return (
    <div className="fixed inset-0 z-50 bg-card" data-testid="modal-story">
      <div className="flex flex-col h-full">
        <div className="sticky top-0 z-10 bg-card border-b">
          <div className="flex items-center justify-between p-4">
            <Button
              size="icon"
              variant="ghost"
              onClick={onClose}
              data-testid="button-close"
            >
              <X className="h-6 w-6" />
            </Button>
            <Button
              size="icon"
              variant="ghost"
              className={isLiked ? "text-destructive" : ""}
              onClick={onLike}
              data-testid="button-like-modal"
            >
              <Heart className={`h-5 w-5 ${isLiked ? "fill-current" : ""}`} />
            </Button>
          </div>
        </div>

        <ScrollArea className="flex-1">
          <div className="max-w-prose mx-auto px-6 py-8 space-y-6">
            <div className="space-y-4">
              <h1 className="text-3xl font-serif font-semibold text-foreground" data-testid="text-story-modal-title">
                {title}
              </h1>

              <div className="flex flex-wrap items-center gap-2">
                <div className="flex items-center gap-1 text-sm text-muted-foreground" data-testid="text-reading-time-modal">
                  <Clock className="h-3 w-3" />
                  {readingTime} min
                </div>
                <span className="text-muted-foreground">|</span>
                <Badge variant="secondary" data-testid="badge-language-modal">
                  {language}
                </Badge>
                {isTranslated && originalLanguage && (
                  <Badge variant="outline" className="gap-1" data-testid="badge-translated-modal">
                    <Globe className="h-3 w-3" />
                    Translated from {originalLanguage}
                  </Badge>
                )}
              </div>

              <div className="flex items-center justify-between text-sm text-muted-foreground pt-2 border-t">
                {authorName && (
                  <div className="flex items-center gap-1" data-testid="text-author-modal">
                    <Book className="h-4 w-4" />
                    <span>Author: {authorName}</span>
                  </div>
                )}
                {likeCount > 0 && (
                  <span className="text-muted-foreground" data-testid="text-like-count-modal">
                    {likeCount} {likeCount === 1 ? "like" : "likes"}
                  </span>
                )}
              </div>
            </div>

            <div className="prose prose-lg max-w-none">
              <p className="text-lg font-serif leading-loose text-foreground whitespace-pre-wrap" data-testid="text-story-content">
                {fullContent}
              </p>
            </div>

            {moral && (
              <div className="p-4 bg-muted/50 rounded-md border" data-testid="section-moral-modal">
                <p className="text-base text-foreground italic">
                  <span className="font-semibold not-italic">Moral of the Story:</span> {moral}
                </p>
              </div>
            )}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}
