import { useState } from "react";
import { User as UserIcon, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import SettingsDialog from "./SettingsDialog";
import type { User } from "@shared/schema";

export interface ProfileSectionProps {
  user: User;
  childAge: string;
  preferredLanguage: string;
  onChildAgeChange: (age: string) => void;
  onLanguageChange: (language: string) => void;
  onSignOut: () => void;
}

const AGE_RANGES = ["0-2 years", "3-5 years", "6-10 years"];
const LANGUAGES = [
  { value: "en", label: "English" },
  { value: "fr", label: "French" },
  { value: "es", label: "Spanish" },
  { value: "de", label: "German" },
];

export default function ProfileSection({
  user,
  childAge,
  preferredLanguage,
  onChildAgeChange,
  onLanguageChange,
  onSignOut,
}: ProfileSectionProps) {
  const [settingsOpen, setSettingsOpen] = useState(false);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Avatar className="h-16 w-16">
            <AvatarFallback className="bg-primary text-primary-foreground text-xl">
              {user.username.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div>
            <h2 className="text-xl font-semibold text-foreground" data-testid="text-profile-name">
              {user.username}
            </h2>
            <p className="text-sm text-muted-foreground">Parent Account</p>
          </div>
        </div>
        <Button 
          size="icon" 
          variant="ghost" 
          data-testid="button-settings"
          onClick={() => setSettingsOpen(true)}
        >
          <Settings className="h-5 w-5" />
        </Button>
      </div>

      <SettingsDialog
        open={settingsOpen}
        onOpenChange={setSettingsOpen}
        user={user}
      />

      <div className="space-y-4 pt-4 border-t">
        <div className="space-y-2">
          <Label htmlFor="child-age">Child's Age</Label>
          <Select value={childAge} onValueChange={onChildAgeChange}>
            <SelectTrigger id="child-age" data-testid="select-child-age">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {AGE_RANGES.map((age) => (
                <SelectItem key={age} value={age}>
                  {age}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="language">Preferred Language</Label>
          <Select value={preferredLanguage} onValueChange={onLanguageChange}>
            <SelectTrigger id="language" data-testid="select-preferred-language">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {LANGUAGES.map((lang) => (
                <SelectItem key={lang.value} value={lang.value}>
                  {lang.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <Button
        variant="outline"
        className="w-full"
        onClick={onSignOut}
        data-testid="button-signout"
      >
        Sign Out
      </Button>
    </div>
  );
}
