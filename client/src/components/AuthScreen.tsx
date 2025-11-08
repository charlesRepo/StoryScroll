import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";

export default function AuthScreen() {
  const [isSignup, setIsSignup] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { login, signup } = useAuth();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password) {
      toast({
        title: "Error",
        description: "Please enter a username and password",
        variant: "destructive",
      });
      return;
    }

    if (password.length < 6) {
      toast({
        title: "Error",
        description: "Password must be at least 6 characters",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      if (isSignup) {
        await signup(username.trim(), password, email.trim() || undefined);
        toast({
          title: "Welcome!",
          description: "Your account has been created successfully.",
        });
      } else {
        await login(username.trim(), password);
        toast({
          title: "Welcome back!",
          description: "You have been signed in successfully.",
        });
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Authentication failed. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-gradient-to-b from-primary/10 to-background">
      <div className="w-full max-w-md space-y-8">
        <div className="space-y-4 text-center">
          <h1 className="text-4xl font-serif font-bold text-foreground">
            Bedtime Stories
          </h1>
          <p className="text-lg text-muted-foreground">
            Discover the perfect story for your child
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 pt-8">
          <div className="space-y-2">
            <Label htmlFor="username">Username</Label>
            <Input
              id="username"
              type="text"
              placeholder="Enter your username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              disabled={isLoading}
              data-testid="input-username"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="Enter your password (min 6 characters)"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isLoading}
              data-testid="input-password"
              required
              minLength={6}
            />
          </div>

          {isSignup && (
            <div className="space-y-2">
              <Label htmlFor="email">Email (optional)</Label>
              <Input
                id="email"
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
                data-testid="input-email"
              />
            </div>
          )}

          <Button
            type="submit"
            size="lg"
            className="w-full"
            disabled={isLoading}
            data-testid="button-auth-submit"
          >
            {isLoading ? "Please wait..." : isSignup ? "Sign Up" : "Sign In"}
          </Button>
        </form>

        <div className="text-center">
          <button
            type="button"
            onClick={() => setIsSignup(!isSignup)}
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            data-testid="button-toggle-auth-mode"
          >
            {isSignup ? "Already have an account? Sign in" : "Need an account? Sign up"}
          </button>
        </div>

        <p className="text-xs text-muted-foreground text-center pt-4">
          Sign in to save your preferences and liked stories
        </p>
      </div>
    </div>
  );
}
