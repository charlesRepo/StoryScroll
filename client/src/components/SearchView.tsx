import { useState } from "react";
import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export interface SearchableStory {
  id: string;
  title: string;
  summary: string;
  fullContent: string;
  imageUrl: string;
  ageRange: string;
  language: string;
  isTranslated?: boolean;
  originalLanguage?: string;
  sourceType: "classic" | "user-shared";
  authorName?: string;
  likeCount?: number;
  isNative?: boolean;
}

export interface SearchViewProps {
  allStories: SearchableStory[];
  onStoryClick: (id: string) => void;
  onLike: (id: string) => void;
  likedStories: Set<string>;
}

// Simple search function
function searchStory(searchTerm: string, text: string): boolean {
  const search = searchTerm.toLowerCase().trim();
  const target = text.toLowerCase();
  
  // Direct match with spaces
  if (target.includes(search)) {
    return true;
  }
  
  // Fuzzy match without spaces (for typos)
  const searchNoSpaces = search.replace(/\s+/g, '');
  const targetNoSpaces = target.replace(/\s+/g, '');
  
  if (targetNoSpaces.includes(searchNoSpaces)) {
    return true;
  }
  
  // Character sequence match
  let searchIndex = 0;
  for (let i = 0; i < targetNoSpaces.length && searchIndex < searchNoSpaces.length; i++) {
    if (targetNoSpaces[i] === searchNoSpaces[searchIndex]) {
      searchIndex++;
    }
  }
  
  return searchIndex === searchNoSpaces.length;
}

export default function SearchView({
  allStories,
  onStoryClick,
  onLike,
  likedStories,
}: SearchViewProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredStories = searchQuery.trim()
    ? allStories.filter((story) => {
        const searchableText = `${story.title} ${story.summary} ${story.fullContent}`;
        return searchStory(searchQuery, searchableText);
      })
    : [];

  return (
    <div className="h-full flex flex-col bg-background">
      <div className="sticky top-0 z-50 bg-background border-b p-4">
        <div className="relative w-full max-w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground pointer-events-none" />
          <Input
            type="search"
            placeholder="Search stories in any language..."
            className="pl-10 pr-10 w-full"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            data-testid="input-search"
            autoFocus
          />
          {searchQuery && (
            <Button
              size="icon"
              variant="ghost"
              className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8"
              onClick={() => setSearchQuery("")}
              data-testid="button-clear-search"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {!searchQuery.trim() ? (
          <div className="flex flex-col items-center justify-center p-12 text-center">
            <Search className="h-16 w-16 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">
              Search Stories
            </h3>
            <p className="text-sm text-muted-foreground">
              Search for stories by title, keywords, or themes in any language
            </p>
          </div>
        ) : filteredStories.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 text-center">
            <Search className="h-16 w-16 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">
              No stories found
            </h3>
            <p className="text-sm text-muted-foreground">
              Try a different search term
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 p-4">
            {filteredStories.map((story) => (
              <div
                key={story.id}
                className="bg-card border rounded-md overflow-hidden cursor-pointer hover-elevate active-elevate-2"
                onClick={() => onStoryClick(story.id)}
                data-testid={`card-search-result-${story.id}`}
              >
                <img
                  src={story.imageUrl}
                  alt={story.title}
                  className="w-full aspect-[4/3] object-cover"
                />
                <div className="p-3">
                  <h3 className="text-sm font-semibold text-foreground line-clamp-2 mb-1" data-testid={`text-search-result-title-${story.id}`}>
                    {story.title}
                  </h3>
                  <p className="text-xs text-muted-foreground line-clamp-2">
                    {story.summary}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
