import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import logoUrl from "@assets/storyscroll_logo_1762725801637.png";

export interface FilterBarProps {
  selectedLanguage: string;
  onLanguageChange: (language: string) => void;
}

const LANGUAGES = [
  { value: "en", label: "English" },
  { value: "fr", label: "French" },
  { value: "de", label: "German" },
];

export default function FilterBar({
  selectedLanguage,
  onLanguageChange,
}: FilterBarProps) {
  return (
    <div className="sticky top-0 z-50">
      <div 
        className="px-4 py-2 flex items-center gap-3"
        style={{ backgroundColor: 'rgb(19, 50, 81)' }}
        data-testid="header-storyscroll"
      >
        <img 
          src={logoUrl} 
          alt="StoryScroll" 
          className="w-[80px] h-[80px] object-contain flex-shrink-0"
          style={{ transform: 'scaleX(-1)' }}
          data-testid="img-header-logo"
        />
        <h1 
          className="font-serif font-bold"
          style={{ color: 'hsl(43, 85%, 65%)', fontSize: '23px' }}
          data-testid="text-header-title"
        >
          Story Scroll
        </h1>
      </div>

      <div className="bg-white/95 dark:bg-gray-950/95 backdrop-blur supports-[backdrop-filter]:bg-white/80 supports-[backdrop-filter]:dark:bg-gray-950/80 border-b">
        <div className="p-4">
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
    </div>
  );
}
