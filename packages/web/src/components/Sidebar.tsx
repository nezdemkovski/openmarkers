import { useState, useRef, useEffect } from "react";
import { Sun, Moon, Languages, ChevronDown, Clock, GitCompareArrows, FlaskConical, X, Upload, Settings, LogOut, PlusCircle } from "lucide-react";
import type { Category, I18n, Lang, UserData, Route } from "../types.ts";
import { LANGS } from "../i18n.ts";

function countOutOfRange(category: Category): number {
  let count = 0;
  for (const b of category.biomarkers) {
    if (b.results.length === 0) continue;
    const latest = b.results[b.results.length - 1];
    if (typeof latest.value === "number") {
      if ((b.refMin != null && latest.value < b.refMin) || (b.refMax != null && latest.value > b.refMax)) count++;
    }
  }
  return count;
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

interface SidebarProps {
  categories: Category[];
  activeRoute: Route;
  onNavigate: (target: string | null) => void;
  open: boolean;
  isDark: boolean;
  onToggleTheme: () => void;
  lang: Lang;
  onChangeLang: (lang: Lang) => void;
  i18n: I18n;
  profiles: UserData[];
  activeProfileIdx: number;
  onChangeProfile: (idx: number) => void;
  isDemo: boolean;
  onSetDemo: (demo: boolean) => void;
  onImport?: (file: File) => void;
  onAddLabVisit?: () => void;
  authEmail?: string | null;
  onSignOut?: () => void;
}

export default function Sidebar({
  categories,
  activeRoute,
  onNavigate,
  open,
  isDark,
  onToggleTheme,
  lang,
  onChangeLang,
  i18n,
  profiles,
  activeProfileIdx,
  onChangeProfile,
  isDemo,
  onSetDemo,
  onImport,
  onAddLabVisit,
  authEmail,
  onSignOut,
}: SidebarProps) {
  const { t, tCat } = i18n;
  const [langOpen, setLangOpen] = useState(false);
  const [userOpen, setUserOpen] = useState(false);
  const langRef = useRef<HTMLDivElement>(null);
  const userRef = useRef<HTMLDivElement>(null);
  const importRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const close = (e: MouseEvent) => {
      if (langRef.current && !langRef.current.contains(e.target as Node)) setLangOpen(false);
      if (userRef.current && !userRef.current.contains(e.target as Node)) setUserOpen(false);
    };
    document.addEventListener("click", close);
    return () => document.removeEventListener("click", close);
  }, []);

  const activeUser = profiles[activeProfileIdx]?.user;

  return (
    <aside
      className={`sidebar bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col h-screen sticky top-0 ${open ? "open" : ""}`}
    >
      <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold text-gray-900 dark:text-gray-100">{t("appName")}</h1>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{t("subtitle")}</p>
        </div>
        <div className="flex items-center gap-1">
          <div className="relative" ref={langRef}>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setLangOpen((v) => !v);
              }}
              className="flex items-center gap-1 p-1.5 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-xs font-semibold"
              title="Language"
            >
              <Languages className="w-4 h-4" />
              <span>{lang.toUpperCase()}</span>
            </button>
            {langOpen && (
              <div className="absolute right-0 top-full mt-1 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg py-1 z-50 min-w-[80px]">
                {LANGS.map((l) => (
                  <button
                    key={l.code}
                    onClick={(e) => {
                      e.stopPropagation();
                      onChangeLang(l.code);
                      setLangOpen(false);
                    }}
                    className="w-full text-left px-3 py-1.5 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600"
                  >
                    {l.nativeName}
                  </button>
                ))}
              </div>
            )}
          </div>
          <button
            onClick={onToggleTheme}
            className="p-1.5 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            title="Toggle theme"
          >
            {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {isDemo ? (
        <div className="px-3 pt-3">
          <div className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/50">
            <FlaskConical className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0" />
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-amber-800 dark:text-amber-200">Demo Mode</div>
              <div className="text-xs text-amber-600 dark:text-amber-400">Sample data</div>
            </div>
            <button
              onClick={() => onSetDemo(false)}
              className="p-1 rounded hover:bg-amber-200 dark:hover:bg-amber-800/50 transition-colors"
              title="Exit demo"
            >
              <X className="w-4 h-4 text-amber-600 dark:text-amber-400" />
            </button>
          </div>
        </div>
      ) : (
        <>
          {profiles.length > 1 && (
            <div className="px-3 pt-3" ref={userRef}>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setUserOpen((v) => !v);
                }}
                className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 flex items-center justify-center text-xs font-bold shrink-0">
                  {getInitials(activeUser.name)}
                </div>
                <div className="flex-1 text-left min-w-0">
                  <div className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">{activeUser.name}</div>
                  {activeUser.dateOfBirth && (
                    <div className="text-xs text-gray-400 dark:text-gray-500">{activeUser.dateOfBirth}</div>
                  )}
                </div>
                <ChevronDown className="w-4 h-4 text-gray-400 shrink-0" />
              </button>
              {userOpen && (
                <div className="mt-1 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg py-1 z-50">
                  {profiles.map((u, idx) => (
                    <button
                      key={idx}
                      onClick={(e) => {
                        e.stopPropagation();
                        onChangeProfile(idx);
                        setUserOpen(false);
                      }}
                      className={`w-full flex items-center gap-2.5 px-3 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-600 ${idx === activeProfileIdx ? "bg-blue-50 dark:bg-blue-900/20" : ""}`}
                    >
                      <div className="w-7 h-7 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 flex items-center justify-center text-xs font-bold shrink-0">
                        {getInitials(u.user.name)}
                      </div>
                      <div className="min-w-0">
                        <div className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">{u.user.name}</div>
                        {u.user.dateOfBirth && (
                          <div className="text-xs text-gray-400 dark:text-gray-500">{u.user.dateOfBirth}</div>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </>
      )}

      <nav className="flex-1 overflow-y-auto p-3 space-y-1">
        <div
          onClick={() => onNavigate(null)}
          className={`nav-item ${activeRoute.view === "dashboard" ? "active" : ""}`}
        >
          <span>{t("viewAll")}</span>
        </div>
        {categories.map((cat) => {
          const outCount = countOutOfRange(cat);
          const isActive = activeRoute.view === "category" && activeRoute.id === cat.id;
          return (
            <div key={cat.id} onClick={() => onNavigate(cat.id)} className={`nav-item ${isActive ? "active" : ""}`}>
              <span className="truncate">{tCat(cat.id, "name")}</span>
              {outCount > 0 ? (
                <span className="badge-red">{outCount}</span>
              ) : (
                <span className="badge-green">{t("ok")}</span>
              )}
            </div>
          );
        })}
      </nav>

      <div className="p-3 border-t border-gray-200 dark:border-gray-700 space-y-1">
        <button
          onClick={() => onNavigate("timeline")}
          className={`nav-item w-full text-gray-600 dark:text-gray-300 font-medium gap-2 ${activeRoute.view === "timeline" ? "active" : ""}`}
        >
          <Clock className="w-4 h-4" />
          <span className="flex-1 text-left">{t("timeline")}</span>
        </button>
        <button
          onClick={() => onNavigate("compare")}
          className={`nav-item w-full text-gray-600 dark:text-gray-300 font-medium gap-2 ${activeRoute.view === "compare" ? "active" : ""}`}
        >
          <GitCompareArrows className="w-4 h-4" />
          <span className="flex-1 text-left">{t("comparison")}</span>
        </button>
        {!isDemo && onImport && (
          <>
            <input
              ref={importRef}
              type="file"
              accept=".json"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) onImport(file);
                e.target.value = "";
              }}
            />
            <button
              onClick={() => importRef.current?.click()}
              className="nav-item w-full text-gray-600 dark:text-gray-300 font-medium gap-2"
            >
              <Upload className="w-4 h-4" />
              <span className="flex-1 text-left">{t("import")}</span>
            </button>
          </>
        )}
        {!isDemo && onAddLabVisit && (
          <button
            onClick={onAddLabVisit}
            className="nav-item w-full text-gray-600 dark:text-gray-300 font-medium gap-2"
          >
            <PlusCircle className="w-4 h-4" />
            <span className="flex-1 text-left">{t("addLabVisit")}</span>
          </button>
        )}
        {!isDemo && (
          <button
            onClick={() => onSetDemo(true)}
            className="nav-item w-full text-amber-600 dark:text-amber-400 font-medium gap-2"
          >
            <FlaskConical className="w-4 h-4" />
            <span className="flex-1 text-left">Demo</span>
          </button>
        )}
        {!isDemo && (
          <button
            onClick={() => onNavigate("settings")}
            className={`nav-item w-full text-gray-600 dark:text-gray-300 font-medium gap-2 ${activeRoute.view === "settings" ? "active" : ""}`}
          >
            <Settings className="w-4 h-4" />
            <span className="flex-1 text-left">{t("settings")}</span>
          </button>
        )}
        {onSignOut && (
          <>
            {authEmail && (
              <div className="px-2.5 py-1 text-xs text-gray-400 dark:text-gray-500 truncate">
                {authEmail}
              </div>
            )}
            <button
              onClick={onSignOut}
              className="nav-item w-full text-gray-500 dark:text-gray-400 font-medium gap-2"
            >
              <LogOut className="w-4 h-4" />
              <span className="flex-1 text-left">{t("authSignOut") || "Sign Out"}</span>
            </button>
          </>
        )}
      </div>
    </aside>
  );
}
