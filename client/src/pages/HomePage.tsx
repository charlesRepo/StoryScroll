import { useState, useRef, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/lib/auth";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { ToastAction } from "@/components/ui/toast";
import type { Story } from "@shared/schema";
import StoryCard from "@/components/StoryCard";
import FilterBar from "@/components/FilterBar";
import BottomNav from "@/components/BottomNav";
import StoryModal from "@/components/StoryModal";
import CreateStoryForm from "@/components/CreateStoryForm";
import LikedStoriesGrid from "@/components/LikedStoriesGrid";
import ProfileSection from "@/components/ProfileSection";
import SearchView from "@/components/SearchView";
import AuthScreen from "@/components/AuthScreen";
import { Loader2 } from "lucide-react";

export default function HomePage() {
  const { user, isLoading: authLoading, isAuthenticated, logout } = useAuth();
  const { toast } = useToast();
  
  const [activeTab, setActiveTab] = useState<
    "feed" | "search" | "create" | "liked" | "profile"
  >("feed");
  const [selectedLanguage, setSelectedLanguage] = useState<string>("en");
  const [selectedAge, setSelectedAge] = useState<string>("3-5 years");
  const [selectedStory, setSelectedStory] = useState<string | null>(null);
  const [currentStoryIndex, setCurrentStoryIndex] = useState(0);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Update preferences when language or age changes
  useEffect(() => {
    if (isAuthenticated) {
      apiRequest("PATCH", "/api/users/preferences", {
        preferredLanguage: selectedLanguage,
        preferredAgeRange: selectedAge,
      }).catch(console.error);
    }
  }, [selectedLanguage, selectedAge, isAuthenticated]);

  // Fetch stories from API (no auth required for browsing)
  const { data: storiesData, isFetching: isStoriesFetching } = useQuery<{ stories: Story[] }>({
    queryKey: ["/api/stories", selectedLanguage, selectedAge],
    queryFn: async () => {
      const url = `/api/stories?language=${selectedLanguage}&ageRange=${encodeURIComponent(selectedAge)}`;
      const response = await apiRequest("GET", url);
      return await response.json();
    },
  });

  const stories = storiesData?.stories || [];

  // Fetch ALL stories for search (no filters)
  const { data: allStoriesData } = useQuery<{ stories: Story[] }>({
    queryKey: ["/api/stories"],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/stories");
      return await response.json();
    },
  });

  const allStories = allStoriesData?.stories || [];

  // Fetch liked stories
  const { data: likedStoriesData } = useQuery<{ stories: Story[] }>({
    queryKey: ["/api/liked-stories"],
    enabled: isAuthenticated,
  });

  const likedStoriesList = likedStoriesData?.stories || [];
  const likedStoryIds = new Set(likedStoriesList.map((s) => s.id));

  // Like/unlike mutation
  const likeMutation = useMutation({
    mutationFn: async (storyId: string) => {
      const response = await apiRequest("POST", `/api/liked-stories/${storyId}`);
      return await response.json() as { liked: boolean };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/liked-stories"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stories"] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update like status",
        variant: "destructive",
      });
    },
  });

  const handleLike = (storyId: string) => {
    if (!isAuthenticated) {
      toast({
        title: "Sign in required",
        description: "Please sign in to like stories",
      });
      return;
    }
    likeMutation.mutate(storyId);
  };

  // Track pending operations per story
  const [pendingByStory, setPendingByStory] = useState<Record<string, { dismiss?: boolean; undo?: boolean }>>({});

  // Helper to set pending state
  const setPending = (storyId: string, operation: 'dismiss' | 'undo', pending: boolean) => {
    setPendingByStory(prev => {
      const current = prev[storyId] || {};
      if (!pending && !current.dismiss && !current.undo) {
        const { [storyId]: _, ...rest } = prev;
        return rest;
      }
      return {
        ...prev,
        [storyId]: { ...current, [operation]: pending }
      };
    });
  };

  // Dismiss mutation
  const dismissMutation = useMutation({
    mutationFn: async (storyId: string) => {
      const response = await apiRequest("POST", `/api/dismissed-stories/${storyId}`);
      return await response.json() as { dismissed: boolean };
    },
  });

  // Restore mutation
  const restoreMutation = useMutation({
    mutationFn: async (storyId: string) => {
      const response = await apiRequest("DELETE", `/api/dismissed-stories/${storyId}`);
      return await response.json() as { dismissed: boolean };
    },
  });

  const handleDismiss = async (storyId: string) => {
    if (!isAuthenticated) {
      toast({
        title: "Sign in required",
        description: "Please sign in to dismiss stories",
      });
      return;
    }
    if (pendingByStory[storyId]?.dismiss) return;

    setPending(storyId, 'dismiss', true);
    try {
      const data = await dismissMutation.mutateAsync(storyId);
      await queryClient.invalidateQueries({ queryKey: ["/api/stories"] });
      await queryClient.invalidateQueries({ queryKey: ["/api/dismissed-stories"] });

      if (data.dismissed) {
        const dismissedStoryId = storyId;
        toast({
          title: "Story dismissed",
          description: "Story removed from your feed",
          action: (
            <ToastAction 
              altText="Undo dismiss" 
              onClick={() => handleUndo(dismissedStoryId)}
            >
              Undo
            </ToastAction>
          ),
        });
      }
    } catch {
      toast({
        title: "Error",
        description: "Failed to dismiss story",
        variant: "destructive",
      });
    } finally {
      setPending(storyId, 'dismiss', false);
    }
  };

  const handleUndo = async (capturedStoryId: string) => {
    if (pendingByStory[capturedStoryId]?.undo) {
      return;
    }

    setPending(capturedStoryId, 'undo', true);
    try {
      await restoreMutation.mutateAsync(capturedStoryId);
      await queryClient.invalidateQueries({ queryKey: ["/api/stories"] });
      await queryClient.invalidateQueries({ queryKey: ["/api/dismissed-stories"] });
      toast({
        title: "Undone",
        description: "Story restored to feed",
      });
    } catch {
      toast({
        title: "Error",
        description: "Failed to undo",
        variant: "destructive",
      });
    } finally {
      setPending(capturedStoryId, 'undo', false);
    }
  };

  // AI Story generation
  const generateStoryMutation = useMutation({
    mutationFn: async (params: {
      theme: string;
      ageRange: string;
      language: string;
      generateMoral: boolean;
    }) => {
      const response = await apiRequest("POST", "/api/stories/generate", params);
      return await response.json() as { story: Partial<Story> };
    },
    onError: (error: any) => {
      toast({
        title: "Generation failed",
        description: error.message || "Failed to generate story",
        variant: "destructive",
      });
    },
  });

  // Swipe gesture handling
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container || activeTab !== "feed") return;

    let startY = 0;
    let currentY = 0;
    let isDragging = false;

    const handleTouchStart = (e: TouchEvent) => {
      startY = e.touches[0].clientY;
      isDragging = true;
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!isDragging) return;
      currentY = e.touches[0].clientY;
    };

    const handleTouchEnd = () => {
      if (!isDragging) return;
      isDragging = false;

      const diff = startY - currentY;
      const threshold = 50;

      if (Math.abs(diff) > threshold) {
        if (diff > 0 && currentStoryIndex < stories.length - 1) {
          setCurrentStoryIndex((prev) => prev + 1);
        } else if (diff < 0 && currentStoryIndex > 0) {
          setCurrentStoryIndex((prev) => prev - 1);
        }
      }
    };

    container.addEventListener("touchstart", handleTouchStart);
    container.addEventListener("touchmove", handleTouchMove);
    container.addEventListener("touchend", handleTouchEnd);

    return () => {
      container.removeEventListener("touchstart", handleTouchStart);
      container.removeEventListener("touchmove", handleTouchMove);
      container.removeEventListener("touchend", handleTouchEnd);
    };
  }, [currentStoryIndex, activeTab, stories.length]);

  // Auto-scroll to current story with proper snap alignment
  useEffect(() => {
    if (scrollContainerRef.current && activeTab === "feed") {
      const container = scrollContainerRef.current;
      const cards = container.querySelectorAll('[data-testid="card-story"]');
      if (cards[currentStoryIndex]) {
        cards[currentStoryIndex].scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }
    }
  }, [currentStoryIndex, activeTab]);

  // Reset to first story when language or age changes
  useEffect(() => {
    setCurrentStoryIndex(0);
  }, [selectedLanguage, selectedAge]);

  const currentStory = selectedStory
    ? stories.find((s) => s.id === selectedStory) ||
      likedStoriesList.find((s) => s.id === selectedStory)
    : null;

  // Show auth screen only for tabs that require authentication
  const requiresAuth = activeTab === "create" || activeTab === "liked" || activeTab === "profile";
  if (!isAuthenticated && !authLoading && requiresAuth) {
    return (
      <div className="h-screen flex flex-col bg-background">
        <div className="flex-1 flex items-center justify-center">
          <AuthScreen />
        </div>
        <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-background">
      {activeTab === "feed" && (
        <FilterBar
          selectedLanguage={selectedLanguage}
          onLanguageChange={setSelectedLanguage}
          selectedAge={selectedAge}
          onAgeChange={setSelectedAge}
        />
      )}

      <div className="flex-1 overflow-hidden">
        {activeTab === "feed" && (
          <div
            ref={scrollContainerRef}
            className="h-full overflow-y-auto snap-y snap-mandatory scrollbar-hide bg-primary/8"
            style={{ 
              scrollbarWidth: "none", 
              msOverflowStyle: "none",
              scrollSnapStop: "always",
            }}
          >
            {isStoriesFetching ? (
              <div className="min-h-full flex items-center justify-center" data-testid="loading-stories">
                <div className="flex flex-col items-center gap-3">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  <p className="text-sm text-muted-foreground">Loading stories...</p>
                </div>
              </div>
            ) : stories.length === 0 ? (
              <div className="min-h-full flex items-center justify-center p-6 text-center">
                <div>
                  <p className="text-muted-foreground mb-2">No stories found</p>
                  <p className="text-sm text-muted-foreground">
                    Try changing the language or age range filters
                  </p>
                </div>
              </div>
            ) : (
              <>
                {stories.map((story) => (
                  <StoryCard
                    key={story.id}
                    {...story}
                    isLiked={likedStoryIds.has(story.id)}
                    onLike={() => handleLike(story.id)}
                    onDismiss={() => handleDismiss(story.id)}
                    isDismissPending={pendingByStory[story.id]?.dismiss || false}
                    onClick={() => setSelectedStory(story.id)}
                  />
                ))}
                {stories.length > 0 && (
                  <div 
                    className="min-h-full flex items-center justify-center snap-start snap-always p-6"
                    data-testid="end-of-feed"
                  >
                    <div className="text-center">
                      <p className="text-muted-foreground">No more stories to show</p>
                      <p className="text-sm text-muted-foreground mt-2">
                        Try changing the filters to see different stories
                      </p>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {activeTab === "create" && (
          <div className="h-full overflow-y-auto">
            <CreateStoryForm
              onGenerate={(params) => {
                generateStoryMutation.mutate(params);
              }}
              generatedStory={generateStoryMutation.data?.story}
              isGenerating={generateStoryMutation.isPending}
            />
          </div>
        )}

        {activeTab === "search" && (
          <SearchView
            allStories={allStories}
            onStoryClick={(id) => setSelectedStory(id)}
            onLike={handleLike}
            likedStories={likedStoryIds}
          />
        )}

        {activeTab === "liked" && (
          <div className="h-full overflow-y-auto">
            {likedStoriesList.length === 0 ? (
              <div className="h-full flex items-center justify-center p-6 text-center">
                <div>
                  <p className="text-muted-foreground mb-2">No liked stories yet</p>
                  <p className="text-sm text-muted-foreground">
                    Stories you like will appear here
                  </p>
                </div>
              </div>
            ) : (
              <LikedStoriesGrid
                stories={likedStoriesList}
                onStoryClick={(id) => setSelectedStory(id)}
              />
            )}
          </div>
        )}

        {activeTab === "profile" && user && (
          <div className="h-full overflow-y-auto">
            <ProfileSection
              user={user}
              childAge={selectedAge}
              preferredLanguage={selectedLanguage}
              onChildAgeChange={setSelectedAge}
              onLanguageChange={setSelectedLanguage}
              onSignOut={logout}
              onStoryClick={(id) => setSelectedStory(id)}
            />
          </div>
        )}
      </div>

      <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />

      {currentStory && (
        <StoryModal
          {...currentStory}
          isLiked={likedStoryIds.has(currentStory.id)}
          onClose={() => setSelectedStory(null)}
          onLike={() => handleLike(currentStory.id)}
        />
      )}

      <style>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .safe-area-inset-bottom {
          padding-bottom: env(safe-area-inset-bottom);
        }
      `}</style>
    </div>
  );
}
