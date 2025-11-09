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

export default function SearchView({
  allStories,
  onStoryClick,
  onLike,
  likedStories,
}: SearchViewProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredStories = searchQuery.trim()
    ? allStories.filter((story) => {
        const query = searchQuery.toLowerCase();
        const title = story.title.toLowerCase();
        const summary = story.summary.toLowerCase();
        const content = story.fullContent.toLowerCase();
        
        return title.includes(query) || summary.includes(query) || content.includes(query);
      })
    : [];

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Search Header */}
      <div className="sticky top-0 z-50 bg-background border-b p-4">
        <div className="relative">
          <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none z-10">
            <Search className="h-5 w-5 text-muted-foreground" data-testid="icon-search" />
          </div>
          <Input
            type="text"
            placeholder="Search stories..."
            className="pl-10 pr-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            data-testid="input-search"
            autoFocus
          />
          {searchQuery && (
            <Button
              size="icon"
              variant="ghost"
              className="absolute right-2 top-1/2 -translate-y-1/2 h-7 w-7"
              onClick={() => setSearchQuery("")}
              data-testid="button-clear-search"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Results */}
      <div className="flex-1 overflow-y-auto">
        {!searchQuery.trim() ? (
          <div className="flex flex-col items-center justify-center p-12 text-center">
            <Search className="h-16 w-16 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">
              Search Stories
            </h3>
            <p className="text-sm text-muted-foreground">
              Search for stories by title, keywords, or themes
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
                className="bg-card border rounded-md overflow-hidden hover-elevate active-elevate-2"
                data-testid={`card-search-result-${story.id}`}
              >
                <div
                  className="cursor-pointer"
                  onClick={() => onStoryClick(story.id)}
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
                <div className="px-3 pb-3 flex justify-between items-center">
                  <span className="text-xs text-muted-foreground capitalize">
                    {story.ageRange}
                  </span>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8"
                    onClick={(e) => {
                      e.stopPropagation();
                      onLike(story.id);
                    }}
                    data-testid={`button-like-${story.id}`}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      className={`h-5 w-5 ${
                        likedStories.has(story.id)
                          ? "fill-red-500 stroke-red-500"
                          : "fill-none stroke-current"
                      }`}
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
                    </svg>
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
