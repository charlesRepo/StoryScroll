import { Button } from "@/components/ui/button";
import { SiGoogle, SiApple } from "react-icons/si";

export interface AuthScreenProps {
  onGoogleSignIn: () => void;
  onAppleSignIn: () => void;
}

export default function AuthScreen({
  onGoogleSignIn,
  onAppleSignIn,
}: AuthScreenProps) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-gradient-to-b from-primary/10 to-background">
      <div className="w-full max-w-md space-y-8 text-center">
        <div className="space-y-4">
          <h1 className="text-4xl font-serif font-bold text-foreground">
            Bedtime Stories
          </h1>
          <p className="text-lg text-muted-foreground">
            Discover the perfect story for your child
          </p>
        </div>

        <div className="space-y-4 pt-8">
          <Button
            size="lg"
            variant="outline"
            className="w-full gap-2"
            onClick={onGoogleSignIn}
            data-testid="button-google-signin"
          >
            <SiGoogle className="h-5 w-5" />
            Sign in with Google
          </Button>

          <Button
            size="lg"
            variant="outline"
            className="w-full gap-2"
            onClick={onAppleSignIn}
            data-testid="button-apple-signin"
          >
            <SiApple className="h-5 w-5" />
            Sign in with Apple
          </Button>
        </div>

        <p className="text-xs text-muted-foreground pt-4">
          Sign in to save your preferences and liked stories
        </p>
      </div>
    </div>
  );
}
