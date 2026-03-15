import type { Lang } from "@openmarkers/db";
import { useState, useEffect, useMemo } from "react";

import { TooltipProvider } from "@/components/ui/tooltip";

import { makeI18n } from "../i18n.ts";
import { api } from "../lib/api.ts";
import { isLang } from "../lib/utils.ts";
import type { UserData } from "../types.ts";
import Dashboard from "./Dashboard.tsx";
import Loading from "./Loading.tsx";
import ThemeLangControls from "./ThemeLangControls";

export default function PublicProfile({ handle }: { handle: string }) {
  const [lang, setLang] = useState<Lang>(() => {
    const saved = localStorage.getItem("lang");
    return isLang(saved) ? saved : "en";
  });
  const [theme, setTheme] = useState<"dark" | "light">(() =>
    document.documentElement.classList.contains("dark") ? "dark" : "light",
  );
  const [data, setData] = useState<UserData | null>(null);
  const [notFound, setNotFound] = useState(false);

  const i18n = useMemo(() => makeI18n(lang), [lang]);
  const isDark = theme === "dark";

  useEffect(() => {
    api.getPublicProfile(handle).then((result) => {
      if (result) setData(result);
      else setNotFound(true);
    });
  }, [handle]);

  const toggleTheme = () => {
    setTheme((prev) => {
      const next = prev === "dark" ? "light" : "dark";
      document.documentElement.classList.toggle("dark");
      localStorage.theme = next;
      return next;
    });
  };

  if (notFound) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold text-foreground">
            {i18n.t("publicProfileNotFound")}
          </h1>
          <p className="text-muted-foreground">
            {i18n.t("publicProfileNotFoundDesc")}
          </p>
          <a
            href="/"
            className="text-lg font-bold text-foreground hover:opacity-80 inline-block mt-4"
          >
            OpenMarkers
          </a>
        </div>
      </div>
    );
  }

  if (!data) return <Loading visible={true} text={i18n.t("loading")} />;

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-background">
        <header className="sticky top-0 bg-background/95 backdrop-blur border-b px-4 py-3 flex items-center justify-between z-30">
          <div className="flex items-center gap-3">
            <a
              href="/"
              className="text-lg font-bold text-foreground hover:opacity-80"
            >
              OpenMarkers
            </a>
            <span className="text-sm text-muted-foreground">
              {i18n.t("publicProfileTitle").replace("{name}", data.user.name)}
            </span>
          </div>
          <ThemeLangControls
            isDark={isDark}
            onToggleTheme={toggleTheme}
            lang={lang}
            onChangeLang={setLang}
          />
        </header>
        <div className="p-4 md:p-6 lg:p-8 max-w-7xl mx-auto">
          <Dashboard
            userData={data}
            categories={data.categories}
            onNavigate={() => {}}
            isDark={isDark}
            lang={lang}
            i18n={i18n}
          />
        </div>
      </div>
    </TooltipProvider>
  );
}
