import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export interface FilterBarProps {
  selectedAge: string;
  selectedLanguage: string;
  onAgeChange: (age: string) => void;
  onLanguageChange: (language: string) => void;
}

const AGE_RANGES = ["0-2 years", "3-5 years", "6-10 years"];
const LANGUAGES = [
  { value: "en", label: "English" },
  { value: "fr", label: "French" },
  { value: "es", label: "Spanish" },
  { value: "de", label: "German" },
];

export default function FilterBar({
  selectedAge,
  selectedLanguage,
  onAgeChange,
  onLanguageChange,
}: FilterBarProps) {
  return (
    <div className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 border-b">
      <div className="p-4 space-y-3">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide">
          {AGE_RANGES.map((age) => (
            <Badge
              key={age}
              variant={selectedAge === age ? "default" : "outline"}
              className="cursor-pointer whitespace-nowrap hover-elevate active-elevate-2"
              onClick={() => onAgeChange(age)}
              data-testid={`button-age-${age.replace(/\s+/g, "-")}`}
            >
              {age}
            </Badge>
          ))}
        </div>

        <Select value={selectedLanguage} onValueChange={onLanguageChange}>
          <SelectTrigger className="w-full" data-testid="select-language">
            <SelectValue placeholder="Select language" />
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
  );
}
