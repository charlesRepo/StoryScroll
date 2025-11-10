import { X } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface FeedWelcomeBannerProps {
  onDismiss: () => void;
}

export function FeedWelcomeBanner({ onDismiss }: FeedWelcomeBannerProps) {
  return (
    <Card className="mx-4 mt-4 mb-3 p-4 relative">
      <Button
        size="icon"
        variant="ghost"
        onClick={onDismiss}
        className="absolute top-0 right-0 h-8 w-8"
        data-testid="button-dismiss-banner"
        aria-label="Dismiss welcome message"
      >
        <X className="h-4 w-4" />
      </Button>

      <div className="pr-8 space-y-2">
        <h2 className="text-lg font-semibold text-foreground">
          Welcome to Story Scroll!
        </h2>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Story Scroll helps parents discover the perfect bedtime story. Browse hundreds of classic tales, create custom AI-powered stories for your child, and share your favorites with other parents. Filter by age and language to find exactly what you need.
        </p>
      </div>
    </Card>
  );
}
