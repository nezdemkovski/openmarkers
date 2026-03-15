import type { Lang } from "@openmarkers/db";
import { Sun, Moon, Languages } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";

import { LANGS } from "../i18n";

interface ThemeLangControlsProps {
  isDark: boolean;
  onToggleTheme: () => void;
  lang: Lang;
  onChangeLang: (lang: Lang) => void;
}

export default function ThemeLangControls({
  isDark,
  onToggleTheme,
  lang,
  onChangeLang,
}: ThemeLangControlsProps) {
  return (
    <div className="flex items-center gap-1">
      <DropdownMenu>
        <DropdownMenuTrigger
          render={<Button variant="ghost" size="icon-sm" />}
          title="Language"
          className="gap-1 w-auto px-1.5 text-xs font-semibold"
        >
          <Languages className="w-4 h-4" />
          <span>{lang.toUpperCase()}</span>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" side="bottom">
          {LANGS.map((l) => (
            <DropdownMenuItem key={l.code} onClick={() => onChangeLang(l.code)}>
              {l.nativeName}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
      <Button
        variant="ghost"
        size="icon-sm"
        onClick={onToggleTheme}
        title="Toggle theme"
      >
        {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
      </Button>
    </div>
  );
}
