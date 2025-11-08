import { Home, Plus, Heart, User } from "lucide-react";
import { Button } from "@/components/ui/button";

export interface BottomNavProps {
  activeTab: "feed" | "create" | "liked" | "profile";
  onTabChange: (tab: "feed" | "create" | "liked" | "profile") => void;
}

export default function BottomNav({ activeTab, onTabChange }: BottomNavProps) {
  const tabs = [
    { id: "feed" as const, icon: Home, label: "Feed", testId: "button-nav-feed" },
    { id: "create" as const, icon: Plus, label: "Create", testId: "button-nav-create" },
    { id: "liked" as const, icon: Heart, label: "Liked", testId: "button-nav-liked" },
    { id: "profile" as const, icon: User, label: "Profile", testId: "button-nav-profile" },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-card border-t">
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
                activeTab === id ? "text-primary" : "text-muted-foreground"
              }`}
            />
            <span
              className={`text-xs ${
                activeTab === id ? "text-primary font-medium" : "text-muted-foreground"
              }`}
            >
              {label}
            </span>
          </Button>
        ))}
      </div>
    </nav>
  );
}
