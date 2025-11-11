import { X } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

interface FeedWelcomeBannerProps {
  onDismiss: () => void;
}

export function FeedWelcomeBanner({ onDismiss }: FeedWelcomeBannerProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -100 }}
      animate={{ 
        opacity: 1, 
        y: 0,
        transition: {
          type: "spring",
          damping: 12,
          stiffness: 200,
          duration: 0.6,
          delay: 1.5
        }
      }}
      exit={{ 
        opacity: 0, 
        y: -50,
        transition: {
          duration: 0.3,
          ease: "easeIn"
        }
      }}
    >
      <Card className="mx-4 mt-4 p-4 relative bg-white dark:bg-white z-20 border-b-0 shadow-lg">
      <Button
        size="icon"
        variant="ghost"
        onClick={onDismiss}
        className="!absolute !top-[3px] !right-[3px] h-8 w-8 z-10"
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
    </motion.div>
  );
}
