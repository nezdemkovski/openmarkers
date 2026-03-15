import type { Lang } from "@openmarkers/db";
import { Globe, Loader2 } from "lucide-react";
import { useState, useEffect, useMemo } from "react";

import { makeI18n } from "../i18n.ts";
import { api } from "../lib/api.ts";
import { isLang } from "../lib/utils.ts";
import ThemeLangControls from "./ThemeLangControls";

const GRADIENTS = [
  "from-emerald-400 to-teal-500",
  "from-blue-400 to-indigo-500",
  "from-violet-400 to-purple-500",
  "from-rose-400 to-pink-500",
  "from-amber-400 to-orange-500",
  "from-cyan-400 to-blue-500",
];

export default function PublicProfilesList() {
  const [lang, setLang] = useState<Lang>(() => {
    const saved = localStorage.getItem("lang");
    return isLang(saved) ? saved : "en";
  });
  const [theme, setTheme] = useState<"dark" | "light">(() =>
    document.documentElement.classList.contains("dark") ? "dark" : "light",
  );
  const [profiles, setProfiles] = useState<
    { name: string; handle: string }[] | null
  >(null);

  const i18n = useMemo(() => makeI18n(lang), [lang]);
  const { t } = i18n;
  const isDark = theme === "dark";

  useEffect(() => {
    api
      .listPublicProfiles()
      .then(setProfiles)
      .catch(() => setProfiles([]));
  }, []);

  const toggleTheme = () => {
    setTheme((prev) => {
      const next = prev === "dark" ? "light" : "dark";
      document.documentElement.classList.toggle("dark");
      localStorage.theme = next;
      return next;
    });
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="sticky top-0 bg-background/95 backdrop-blur border-b px-4 py-3 flex items-center justify-between z-30">
        <div className="flex items-center gap-3">
          <a
            href="/"
            className="text-lg font-bold text-foreground hover:opacity-80"
          >
            OpenMarkers
          </a>
          <span className="text-sm text-muted-foreground">
            {t("openProfiles")}
          </span>
        </div>
        <ThemeLangControls
          isDark={isDark}
          onToggleTheme={toggleTheme}
          lang={lang}
          onChangeLang={setLang}
        />
      </header>

      <main className="flex-1 max-w-2xl mx-auto w-full px-5 py-8">
        <div className="flex items-center gap-2.5 mb-1">
          <Globe className="w-4 h-4 text-muted-foreground/50" />
          <h1 className="text-lg font-semibold text-foreground">
            {t("openProfiles")}
          </h1>
        </div>
        <p className="text-sm text-muted-foreground/60 mb-6">
          {t("openProfilesDesc")}
        </p>

        {profiles === null ? (
          <div className="flex justify-center py-16">
            <Loader2 className="w-6 h-6 text-muted-foreground/30 animate-spin" />
          </div>
        ) : profiles.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground/40 text-sm">
            {t("openProfilesDesc")}
          </div>
        ) : (
          <div className="rounded-xl border border-border/40 bg-card overflow-hidden">
            <table className="w-full">
              <tbody>
                {profiles.map((p, i) => (
                  <tr
                    key={p.handle}
                    className="group border-b border-border/20 last:border-b-0"
                  >
                    <td className="w-0 pl-4 pr-2 py-3">
                      <span className="text-xs text-muted-foreground/30 tabular-nums font-medium">
                        {i + 1}
                      </span>
                    </td>
                    <td className="py-3 pr-2">
                      <a
                        href={`/p/${p.handle}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3"
                      >
                        <div
                          className={`w-8 h-8 rounded-full bg-gradient-to-br ${GRADIENTS[i % GRADIENTS.length]} flex items-center justify-center text-white text-xs font-bold shrink-0`}
                        >
                          {p.name.charAt(0).toUpperCase()}
                        </div>
                        <span className="text-sm font-medium text-foreground truncate group-hover:text-foreground/70 transition-colors">
                          {p.name}
                        </span>
                      </a>
                    </td>
                    <td className="py-3 pr-4 text-right">
                      <a
                        href={`/p/${p.handle}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-muted-foreground/35 font-mono group-hover:text-muted-foreground/60 transition-colors"
                      >
                        /p/{p.handle}
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
}
