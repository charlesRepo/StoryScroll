import { motion } from "framer-motion";
import { ArrowUp } from "lucide-react";
import { Button } from "@/components/ui/button";

interface BackToTopButtonProps {
  onClick: () => void;
}

// Reuse the bouncy spring animation from FeedWelcomeBanner
export function BackToTopButton({ onClick }: BackToTopButtonProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{
        opacity: 1,
        y: 0,
        transition: {
          type: "spring",
          damping: 12,
          stiffness: 200,
          duration: 0.6,
        },
      }}
      exit={{
        opacity: 0,
        y: 50,
        transition: {
          duration: 0.3,
          ease: "easeIn",
        },
      }}
      className="fixed right-4 bottom-24 z-30"
    >
      <Button
        size="icon"
        className="h-12 w-12 rounded-full shadow-lg bg-white hover:bg-gray-100 text-gray-900 border border-gray-200"
        onClick={onClick}
        aria-label="Back to top"
        data-testid="button-back-to-top"
      >
        <ArrowUp className="h-6 w-6" />
      </Button>
    </motion.div>
  );
}
