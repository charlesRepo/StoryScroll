import { Home, Plus, Heart, User, Search } from "lucide-react";
import { Button } from "@/components/ui/button";

export interface BottomNavProps {
  activeTab: "feed" | "create" | "search" | "liked" | "profile";
  onTabChange: (tab: "feed" | "create" | "search" | "liked" | "profile") => void;
}

export default function BottomNav({ activeTab, onTabChange }: BottomNavProps) {
  const tabs = [
    { id: "feed" as const, icon: Home, label: "Feed", testId: "button-nav-feed" },
    { id: "create" as const, icon: Plus, label: "Create", testId: "button-nav-create" },
    { id: "search" as const, icon: Search, label: "Search", testId: "button-nav-search" },
    { id: "liked" as const, icon: Heart, label: "Liked", testId: "button-nav-liked" },
    { id: "profile" as const, icon: User, label: "Profile", testId: "button-nav-profile" },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-gray-950 border-t">
      <div className="flex items-center justify-around h-16 safe-area-inset-bottom">
        {tabs.map(({ id, icon: Icon, label, testId }) => (
          <Button
            key={id}
            variant="ghost"
            className="flex flex-col items-center gap-1 h-auto py-2 px-3"
            onClick={() => onTabChange(id)}
            data-testid={testId}
          >
            <Icon
              className={`h-6 w-6 ${
                activeTab === id ? "text-foreground" : "text-muted-foreground"
              }`}
              style={activeTab === id ? { color: 'rgb(19, 50, 81)' } : undefined}
            />
            <span
              className={`text-xs ${
                activeTab === id ? "text-foreground font-medium" : "text-muted-foreground"
              }`}
              style={activeTab === id ? { color: 'rgb(19, 50, 81)' } : undefined}
            >
              {label}
            </span>
          </Button>
        ))}
      </div>
    </nav>
  );
}
