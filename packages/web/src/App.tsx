import { useState, useEffect, useCallback, useMemo } from "react";
import { Copy, CheckCheck } from "lucide-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { makeI18n } from "./i18n.ts";
import { authClient } from "./lib/auth-client.ts";
import { api, setTokenProvider, setOnUnauthorized } from "./lib/api.ts";
import AuthPage from "./components/AuthPage.tsx";
import Sidebar from "./components/Sidebar.tsx";
import Dashboard from "./components/Dashboard.tsx";
import CategoryView from "./components/CategoryView.tsx";
import TimelineView from "./components/TimelineView.tsx";
import ComparisonView from "./components/ComparisonView.tsx";
import SettingsView from "./components/SettingsView.tsx";
import Loading from "./components/Loading.tsx";
import AddLabVisit from "./components/AddLabVisit.tsx";
import PrivacyPolicy from "./components/PrivacyPolicy.tsx";
import TermsOfService from "./components/TermsOfService.tsx";
import type { UserData, Route, Sex } from "./types.ts";
import { isLang, errorMessage } from "./lib/utils.ts";
import type { Lang } from "@openmarkers/db";

function getInitialTheme(): "dark" | "light" {
  return document.documentElement.classList.contains("dark") ? "dark" : "light";
}

function getRouteFromPath(): Route {
  const path = window.location.pathname;
  if (path === "/privacy") return { view: "privacy" };
  if (path === "/terms") return { view: "terms" };
  if (path === "/timeline") return { view: "timeline" };
  if (path === "/compare") return { view: "compare" };
  if (path === "/settings") return { view: "settings" };
  const match = path.match(/^\/category\/(.+)$/);
  if (match) return { view: "category", id: decodeURIComponent(match[1]) };
  return { view: "dashboard" };
}

// Set up token provider for API calls
setTokenProvider(async () => {
  try {
    const session = await authClient.getSession();
    return session?.data?.session?.token ?? null;
  } catch {
    return null;
  }
});

interface ImportData { user: { name: string }; [key: string]: unknown }
function isImportData(data: unknown): data is ImportData {
  if (typeof data !== "object" || data === null || !("user" in data)) return false;
  const { user } = data;
  if (typeof user !== "object" || user === null || !("name" in user)) return false;
  return typeof user.name === "string";
}

const EMPTY_USER_DATA: UserData = {
  user: { id: 0, name: "", dateOfBirth: "", sex: "M" },
  categories: [],
};

export default function App() {
  const queryClient = useQueryClient();
  const [theme, setTheme] = useState(getInitialTheme);
  const [lang, setLang] = useState<Lang>(() => {
    const saved = localStorage.getItem("lang");
    return isLang(saved) ? saved : "en";
  });
  const [route, setRoute] = useState(getRouteFromPath);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isDemo, setIsDemo] = useState(false);
  const [demoData, setDemoData] = useState<UserData | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null); // null = checking
  const [authEmail, setAuthEmail] = useState<string | null>(null);
  const [activeProfileId, setActiveProfileId] = useState<number | null>(() => {
    const saved = localStorage.getItem("activeProfileId");
    return saved ? Number(saved) : null;
  });

  const i18n = useMemo(() => makeI18n(lang), [lang]);

  // Set up unauthorized handler
  useEffect(() => {
    setOnUnauthorized(() => {
      setIsAuthenticated(false);
      setAuthEmail(null);
      localStorage.removeItem("wasAuthenticated");
    });
  }, []);

  // Check auth session on mount
  useEffect(() => {
    authClient
      .getSession()
      .then((result) => {
        if (result?.data?.session) {
          setIsAuthenticated(true);
          setAuthEmail(result.data.user?.email ?? null);
          localStorage.setItem("wasAuthenticated", "1");
        } else {
          setIsAuthenticated(false);
          localStorage.removeItem("wasAuthenticated");
        }
      })
      .catch(() => {
        setIsAuthenticated(false);
        localStorage.removeItem("wasAuthenticated");
      });
  }, []);

  // Fetch profile list (only when authenticated)
  const { data: profileList = [], isSuccess: profileListLoaded } = useQuery({
    queryKey: ["profiles"],
    queryFn: api.listProfiles,
    enabled: isAuthenticated === true && !isDemo,
  });

  // Auto-select first profile if none active
  useEffect(() => {
    if (profileList.length > 0 && activeProfileId === null) {
      setActiveProfileId(profileList[0].id);
    }
  }, [profileList, activeProfileId]);

  // Fetch full profile data for active profile
  const { data: profileData } = useQuery({
    queryKey: ["profile", activeProfileId],
    queryFn: () => api.getProfile(activeProfileId!),
    enabled: activeProfileId !== null && !isDemo && isAuthenticated === true,
  });

  // Build UserData[] for sidebar from profileList
  const sidebarUsers: UserData[] = useMemo(() => {
    if (profileData && profileList.length > 0) {
      return profileList.map((u) =>
        u.id === activeProfileId
          ? profileData
          : { user: { id: u.id, name: u.name, dateOfBirth: u.dateOfBirth, sex: u.sex }, categories: [] },
      );
    }
    return [];
  }, [profileList, profileData, activeProfileId]);

  const activeProfileIdx = useMemo(() => {
    if (activeProfileId === null) return 0;
    const idx = profileList.findIndex((u) => u.id === activeProfileId);
    return idx >= 0 ? idx : 0;
  }, [profileList, activeProfileId]);

  const hasNoProfiles = isAuthenticated && !isDemo && profileListLoaded && profileList.length === 0;
  const showGettingStarted = !isDemo && (hasNoProfiles || (profileData && profileData.categories.length === 0));
  const displayData = isDemo && demoData ? demoData : hasNoProfiles ? EMPTY_USER_DATA : profileData;

  const handleResultMutate = useCallback(() => {
    if (activeProfileId != null) {
      queryClient.invalidateQueries({ queryKey: ["profile", activeProfileId] });
    }
  }, [queryClient, activeProfileId]);
  const isDark = theme === "dark";

  const navigateTo = useCallback((path: string) => {
    history.pushState(null, "", path);
    setRoute(getRouteFromPath());
  }, []);

  const navigate = useCallback((target: string | null) => {
    if (target === null) {
      navigateTo("/");
    } else if (target === "timeline" || target === "compare" || target === "settings") {
      navigateTo(`/${target}`);
    } else {
      navigateTo(`/category/${target}`);
    }
  }, [navigateTo]);

  const changeProfile = useCallback(
    (idx: number) => {
      const profile = profileList[idx];
      if (!profile) return;
      setActiveProfileId(profile.id);
      setIsDemo(false);
      localStorage.setItem("activeProfileId", String(profile.id));
      navigateTo("/");
    },
    [profileList, navigateTo],
  );

  const setDemoMode = useCallback(
    (demo: boolean) => {
      if (demo && !demoData) {
        import("../data/demo.json").then((m: { default: UserData }) => {
          setDemoData(m.default);
          setIsDemo(true);
          navigateTo("/");
        });
        return;
      }
      setIsDemo(demo);
      navigateTo("/");
    },
    [demoData, navigateTo],
  );

  const toggleTheme = useCallback(() => {
    setTheme((prev) => {
      const next = prev === "dark" ? "light" : "dark";
      document.documentElement.classList.add("theme-transition");
      document.documentElement.classList.toggle("dark");
      localStorage.theme = next;
      setTimeout(() => document.documentElement.classList.remove("theme-transition"), 200);
      return next;
    });
  }, []);


  const [importPending, setImportPending] = useState<{ data: ImportData; name: string } | null>(null);
  const [importName, setImportName] = useState("");
  const [importing, setImporting] = useState(false);
  const [addLabVisitProfileId, setAddLabVisitProfileId] = useState<number | null>(null);

  const switchToProfile = useCallback((profileId: number) => {
    queryClient.invalidateQueries({ queryKey: ["profiles"] });
    queryClient.invalidateQueries({ queryKey: ["profile", profileId] });
    setActiveProfileId(profileId);
    localStorage.setItem("activeProfileId", String(profileId));
    setIsDemo(false);
    navigateTo("/");
  }, [queryClient, navigateTo]);

  const handleImport = useCallback(
    async (file: File) => {
      setImporting(true);
      try {
        const text = await file.text();
        let data: unknown;
        try {
          data = JSON.parse(text);
        } catch {
          alert(i18n.t("importInvalidJson"));
          setImporting(false);
          return;
        }
        if (!isImportData(data)) {
          alert(i18n.t("importError"));
          setImporting(false);
          return;
        }
        const check = await api.checkImport(data);
        if (check.exists) {
          setImportPending({ data, name: data.user.name });
          setImportName(data.user.name + " (2)");
          setImporting(false);
        } else {
          const r = await api.importProfile(data);
          const pd = await api.getProfile(r.profile_id);
          queryClient.setQueryData(["profile", r.profile_id], pd);
          await queryClient.invalidateQueries({ queryKey: ["profiles"] });
          setActiveProfileId(r.profile_id);
          localStorage.setItem("activeProfileId", String(r.profile_id));
          setIsDemo(false);
          setImporting(false);
          navigateTo("/");
        }
      } catch (e) {
        console.error("[import] failed:", e);
        setImporting(false);
      }
    },
    [i18n, queryClient, navigateTo],
  );

  const confirmImport = useCallback(() => {
    if (!importPending) return;
    setImporting(true);
    const data = { ...importPending.data, user: { ...importPending.data.user, name: importName } };
    api.importProfile(data).then(async (r) => {
      setImportPending(null);
      const pd = await api.getProfile(r.profile_id);
      queryClient.setQueryData(["profile", r.profile_id], pd);
      await queryClient.invalidateQueries({ queryKey: ["profiles"] });
      setActiveProfileId(r.profile_id);
      localStorage.setItem("activeProfileId", String(r.profile_id));
      setIsDemo(false);
      setImporting(false);
      navigateTo("/");
    }).catch(() => setImporting(false));
  }, [importPending, importName, queryClient, navigateTo]);

  const changeLang = useCallback((l: Lang) => {
    localStorage.setItem("lang", l);
    setLang(l);
  }, []);

  const sidebarNavigate = useCallback(
    (id: string | null) => {
      navigate(id);
      setSidebarOpen(false);
    },
    [navigate],
  );

  const handleDeleteAccount = useCallback(() => {
    api.deleteAccount().then(() => {
      authClient.signOut().then(() => {
        setIsAuthenticated(false);
        setAuthEmail(null);
        setActiveProfileId(null);
        localStorage.removeItem("activeProfileId");
        localStorage.removeItem("wasAuthenticated");
        queryClient.clear();
        navigateTo("/");
      });
    });
  }, [queryClient, navigateTo]);

  const handleExportProfile = useCallback((profileId: number) => {
    api.exportProfile(profileId).then((data) => {
      const p = profileList.find((u) => u.id === profileId);
      const userName = p?.name?.toLowerCase().replace(/\s+/g, "_") ?? "profile";
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${userName}.json`;
      a.click();
      URL.revokeObjectURL(url);
    });
  }, [profileList]);

  const handleProfilesReordered = useCallback((profileIds: number[]) => {
    api.reorderProfiles(profileIds).then(() => {
      queryClient.invalidateQueries({ queryKey: ["profiles"] });
    });
  }, [queryClient]);

  const handleProfileDeleted = useCallback((profileId: number) => {
    queryClient.invalidateQueries({ queryKey: ["profiles"] }).then(() => {
      const remaining = profileList.filter((u) => u.id !== profileId);
      if (activeProfileId === profileId) {
        if (remaining.length > 0) {
          setActiveProfileId(remaining[0].id);
          localStorage.setItem("activeProfileId", String(remaining[0].id));
        } else {
          setActiveProfileId(null);
          localStorage.removeItem("activeProfileId");
        }
      }
    });
  }, [queryClient, profileList, activeProfileId]);

  const handleSignOut = useCallback(() => {
    authClient.signOut().then(() => {
      setIsAuthenticated(false);
      setAuthEmail(null);
      setActiveProfileId(null);
      localStorage.removeItem("activeProfileId");
      localStorage.removeItem("wasAuthenticated");
      queryClient.clear();
    });
  }, [queryClient]);

  useEffect(() => {
    const onPopState = () => setRoute(getRouteFromPath());
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);

  // Legal pages — accessible without auth
  if (route.view === "privacy") return <PrivacyPolicy onBack={() => window.history.back()} />;
  if (route.view === "terms") return <TermsOfService onBack={() => window.history.back()} />;

  // Still checking auth — show loading if user was previously logged in, otherwise landing page
  const maybeReturningUser = isAuthenticated === null && localStorage.getItem("wasAuthenticated");
  if (maybeReturningUser) return <Loading visible={true} text={i18n.t("loading")} />;

  // Not authenticated and not in demo mode -> show landing page
  if (isAuthenticated !== true && !isDemo) {
    return (
      <AuthPage
        onAuthenticated={() => {
          authClient.getSession().then((result) => {
            setIsAuthenticated(true);
            setAuthEmail(result?.data?.user?.email ?? null);
            localStorage.setItem("wasAuthenticated", "1");
          });
        }}
        onDemo={() => setDemoMode(true)}
        i18n={i18n}
        lang={lang}
        onChangeLang={changeLang}
        isDark={isDark}
        onToggleTheme={toggleTheme}
      />
    );
  }

  if (!displayData) return <Loading visible={true} text={i18n.t("loading")} />;

  const category = route.view === "category" ? displayData.categories.find((c) => c.id === route.id) : null;

  return (
    <>
      <Loading visible={false} />
      <div className="flex min-h-screen">
        <Sidebar
          categories={displayData.categories}
          activeRoute={route}
          onNavigate={sidebarNavigate}
          open={sidebarOpen}
          isDark={isDark}
          onToggleTheme={toggleTheme}
          lang={lang}
          onChangeLang={changeLang}
          i18n={i18n}
          profiles={sidebarUsers}
          activeProfileIdx={activeProfileIdx}
          onChangeProfile={changeProfile}
          isDemo={isDemo}
          onSetDemo={setDemoMode}
          onImport={handleImport}
          onAddLabVisit={activeProfileId != null && !isDemo ? () => setAddLabVisitProfileId(activeProfileId) : undefined}
          authEmail={authEmail}
          onSignOut={handleSignOut}
        />
        <main className="flex-1 min-w-0">
          <header className="md:hidden sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-3 flex items-center z-30">
            <button className="mr-3 p-1" onClick={() => setSidebarOpen(true)}>
              <MenuIcon />
            </button>
            <h1 className="text-lg font-bold">OpenMarkers</h1>
          </header>
          <div className="p-4 md:p-6 lg:p-8 max-w-7xl mx-auto">
            {route.view === "settings" && !isDemo ? (
              <SettingsView
                i18n={i18n}
                profiles={profileList}
                activeProfileId={activeProfileId}
                onProfileUpdated={() => queryClient.invalidateQueries({ queryKey: ["profiles"] })}
                onProfileDeleted={handleProfileDeleted}
                onProfilesReordered={handleProfilesReordered}
                authEmail={authEmail}
                onDeleteAccount={handleDeleteAccount}
                onExport={handleExportProfile}
              />
            ) : showGettingStarted ? (
              <GettingStarted
                i18n={i18n}
                onImport={handleImport}
                onCreated={switchToProfile}
                onAddLabVisit={(profileId) => setAddLabVisitProfileId(profileId)}
                importing={importing}
                hasProfile={!hasNoProfiles}
                activeProfileId={activeProfileId}
              />
            ) : route.view === "category" && category ? (
              <CategoryView category={category} isDark={isDark} i18n={i18n} profileId={isDemo ? undefined : (activeProfileId ?? undefined)} onMutate={isDemo ? undefined : handleResultMutate} />
            ) : route.view === "timeline" ? (
              <TimelineView categories={displayData.categories} isDark={isDark} i18n={i18n} />
            ) : route.view === "compare" ? (
              <ComparisonView categories={displayData.categories} isDark={isDark} i18n={i18n} />
            ) : (
              <Dashboard
                userData={displayData}
                categories={displayData.categories}
                onNavigate={navigate}
                isDark={isDark}
                lang={lang}
                i18n={i18n}
                profileId={isDemo ? undefined : (activeProfileId ?? undefined)}
                onMutate={isDemo ? undefined : handleResultMutate}
              />
            )}
          </div>
        </main>
      </div>
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/30 z-30 md:hidden" onClick={() => setSidebarOpen(false)} />
      )}
      {importPending && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-md w-full p-6 space-y-4">
            <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">{i18n.t("importConflictTitle")}</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">{i18n.t("importConflictMessage").replace("{name}", importPending.name)}</p>
            <input
              type="text"
              value={importName}
              onChange={(e) => setImportName(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setImportPending(null)}
                className="px-4 py-2 text-sm rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                {i18n.t("importCancel")}
              </button>
              <button
                onClick={confirmImport}
                disabled={!importName.trim()}
                className="px-4 py-2 text-sm rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
              >
                {i18n.t("importRename")}
              </button>
            </div>
          </div>
        </div>
      )}
      {addLabVisitProfileId !== null && (
        <AddLabVisit
          profileId={addLabVisitProfileId}
          i18n={i18n}
          onClose={() => {
            const pid = addLabVisitProfileId;
            setAddLabVisitProfileId(null);
            switchToProfile(pid);
          }}
          onSuccess={() => {
            const pid = addLabVisitProfileId;
            setAddLabVisitProfileId(null);
            switchToProfile(pid);
          }}
        />
      )}
    </>
  );
}

function GettingStarted({
  i18n,
  onImport,
  onCreated,
  onAddLabVisit,
  importing,
  hasProfile,
  activeProfileId,
}: {
  i18n: ReturnType<typeof makeI18n>;
  onImport: (file: File) => void;
  onCreated: (profileId: number) => void;
  onAddLabVisit: (profileId: number) => void;
  importing: boolean;
  hasProfile: boolean;
  activeProfileId: number | null;
}) {
  const { t } = i18n;
  const [showCreate, setShowCreate] = useState(false);
  const [name, setName] = useState("");
  const [dob, setDob] = useState("");
  const [sex, setSex] = useState<Sex>("M");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !dob) return;
    setLoading(true);
    setError("");
    try {
      const profile = await api.createProfile({ name: name.trim(), date_of_birth: dob, sex });
      onCreated(profile.id);
    } catch (err: unknown) {
      setError(errorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".json";
    input.onchange = () => {
      const file = input.files?.[0];
      if (file) onImport(file);
    };
    input.click();
  };

  const hasActiveProfile = hasProfile && activeProfileId !== null;

  return (
    <div className="max-w-lg mx-auto pt-8 md:pt-16">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{t(hasActiveProfile ? "addYourData" : "allResults")}</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{t(hasActiveProfile ? "addYourDataDesc" : "getStartedDesc")}</p>
      </div>

      <div className="space-y-3">
        {/* Add lab visit — only when profile exists */}
        {hasActiveProfile && (
          <button
            onClick={() => onAddLabVisit(activeProfileId)}
            className="w-full flex items-center gap-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 shadow-sm hover:border-blue-300 dark:hover:border-blue-600 transition-colors text-left"
          >
            <div className="w-10 h-10 rounded-lg bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center shrink-0">
              <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
            </div>
            <div>
              <div className="text-sm font-semibold text-gray-900 dark:text-gray-100">{t("addLabVisit")}</div>
              <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{t("addLabVisitDesc")}</div>
            </div>
          </button>
        )}

        {/* Import data */}
        <ImportButton importing={importing} onClick={handleFileSelect} t={t} />

        {/* Create new profile — only when no profile exists */}
        {!hasActiveProfile && (
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
            <button
              onClick={() => setShowCreate(!showCreate)}
              className="w-full flex items-center gap-4 p-5 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors text-left"
            >
              <div className="w-10 h-10 rounded-lg bg-green-50 dark:bg-green-900/30 flex items-center justify-center shrink-0">
                <svg className="w-5 h-5 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                </svg>
              </div>
              <div className="flex-1">
                <div className="text-sm font-semibold text-gray-900 dark:text-gray-100">{t("createProfile")}</div>
                <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{t("createProfileDesc")}</div>
              </div>
              <svg className={`w-4 h-4 text-gray-400 transition-transform ${showCreate ? "rotate-180" : ""}`} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {showCreate && (
              <form onSubmit={handleCreate} className="px-5 pb-5 space-y-3 border-t border-gray-100 dark:border-gray-700 pt-4">
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={t("profileName")}
                  required
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <input
                  type="date"
                  value={dob}
                  onChange={(e) => setDob(e.target.value)}
                  required
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setSex("M")}
                    className={`flex-1 py-2 text-sm font-medium rounded-lg border transition-colors ${
                      sex === "M"
                        ? "border-blue-500 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300"
                        : "border-gray-300 dark:border-gray-600 text-gray-500 dark:text-gray-400"
                    }`}
                  >
                    {t("sexMale")}
                  </button>
                  <button
                    type="button"
                    onClick={() => setSex("F")}
                    className={`flex-1 py-2 text-sm font-medium rounded-lg border transition-colors ${
                      sex === "F"
                        ? "border-blue-500 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300"
                        : "border-gray-300 dark:border-gray-600 text-gray-500 dark:text-gray-400"
                    }`}
                  >
                    {t("sexFemale")}
                  </button>
                </div>
                {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}
                <button
                  type="submit"
                  disabled={loading || !name.trim() || !dob}
                  className="w-full py-2 px-4 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors"
                >
                  {loading ? "..." : t("createProfile")}
                </button>
              </form>
            )}
          </div>
        )}

        <AiImportSection i18n={i18n} />
        <McpSetupSection i18n={i18n} />
      </div>
    </div>
  );
}

function MenuIcon() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
    </svg>
  );
}

const SCHEMA_URL = "https://openmarkers.app/schema.json";

const AI_PROMPT = `I have lab/blood test results that I need to convert into a specific JSON format for the OpenMarkers app.

First, fetch the schema from: ${SCHEMA_URL}

The schema contains all supported biomarker IDs, units, and reference ranges in x-biomarker-metadata. Use ONLY biomarker IDs that exist in the schema. If a test from my results doesn't match any biomarker in the schema, skip it.

Convert my lab results into this JSON structure:
{
  "$schema": "${SCHEMA_URL}",
  "user": { "name": "My Name", "dateOfBirth": "YYYY-MM-DD", "sex": "M" },
  "categories": [
    {
      "id": "<category_id from schema>",
      "biomarkers": [
        {
          "id": "<biomarker_id from schema>",
          "results": [{ "date": "YYYY-MM-DD", "value": 5.2 }]
        }
      ]
    }
  ]
}

Rules:
- Always include the "$schema" field pointing to ${SCHEMA_URL}
- Match my test names to the closest biomarker ID in the schema (e.g. "Urea" → "S-UREA", "Hemoglobin" → "B-HGB")
- Use the category_id each biomarker belongs to in the schema
- Do NOT include unit/refMin/refMax in the output — the app has its own reference ranges
- Numeric values should be numbers, not strings
- Group results by category, then by biomarker
- If I have results from multiple dates, include all of them under the same biomarker

Here are my lab results:
`;

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      onClick={() => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }}
      className="absolute top-2 right-2 px-2 py-1 text-xs rounded border border-gray-300 dark:border-gray-600 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
    >
      {copied ? <CheckCheck className="w-3.5 h-3.5 text-green-600" /> : <Copy className="w-3.5 h-3.5" />}
    </button>
  );
}

function ImportButton({ importing, onClick, t }: { importing: boolean; onClick: () => void; t: (key: string) => string }) {
  return (
    <button
      onClick={onClick}
      disabled={importing}
      className="w-full flex items-center gap-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 shadow-sm hover:border-blue-300 dark:hover:border-blue-600 transition-colors text-left disabled:opacity-60"
    >
      <div className="w-10 h-10 rounded-lg bg-green-50 dark:bg-green-900/30 flex items-center justify-center shrink-0">
        {importing ? (
          <svg className="w-5 h-5 text-green-600 dark:text-green-400 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        ) : (
          <svg className="w-5 h-5 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
          </svg>
        )}
      </div>
      <div>
        <div className="text-sm font-semibold text-gray-900 dark:text-gray-100">
          {importing ? t("importingData") : t("import")}
        </div>
        <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{t("importDesc")}</div>
      </div>
    </button>
  );
}

function AiImportSection({ i18n }: { i18n: ReturnType<typeof makeI18n> }) {
  const { t } = i18n;
  const [open, setOpen] = useState(false);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-4 p-5 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors text-left"
      >
        <div className="w-10 h-10 rounded-lg bg-purple-50 dark:bg-purple-900/30 flex items-center justify-center shrink-0">
          <svg className="w-5 h-5 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
          </svg>
        </div>
        <div className="flex-1">
          <div className="text-sm font-semibold text-gray-900 dark:text-gray-100">{t("aiImport")}</div>
          <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{t("aiImportDesc")}</div>
        </div>
        <svg className={`w-4 h-4 text-gray-400 transition-transform ${open ? "rotate-180" : ""}`} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {open && (
        <div className="px-5 pb-5 border-t border-gray-100 dark:border-gray-700 pt-4 space-y-3">
          <p className="text-sm text-gray-600 dark:text-gray-400">{t("aiImportInstructions")}</p>
          <div className="relative">
            <pre className="px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-900 text-xs text-gray-700 dark:text-gray-300 font-mono whitespace-pre-wrap max-h-48 overflow-y-auto">{AI_PROMPT.trim()}</pre>
            <CopyButton text={AI_PROMPT} />
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400">{t("aiImportThen")}</p>
          <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 p-3 space-y-1.5">
            <p className="text-xs font-medium text-gray-700 dark:text-gray-300">{t("schemaTip")}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">{t("schemaTipDesc")}</p>
            <div className="relative">
              <pre className="px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-xs text-gray-900 dark:text-gray-100 font-mono">{`"$schema": "${SCHEMA_URL}"`}</pre>
              <CopyButton text={`"$schema": "${SCHEMA_URL}"`} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function McpSetupSection({ i18n }: { i18n: ReturnType<typeof makeI18n> }) {
  const { t } = i18n;
  const [open, setOpen] = useState(false);

  const mcpConfig = JSON.stringify({
    "openmarkers": {
      "type": "http",
      "url": "https://openmarkers.app/mcp",
    }
  }, null, 2);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-4 p-5 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors text-left"
      >
        <div className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center shrink-0">
          <svg className="w-5 h-5 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244" />
          </svg>
        </div>
        <div className="flex-1">
          <div className="text-sm font-semibold text-gray-900 dark:text-gray-100">{t("mcpSetup")}</div>
          <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{t("mcpSetupDesc")}</div>
        </div>
        <svg className={`w-4 h-4 text-gray-400 transition-transform ${open ? "rotate-180" : ""}`} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {open && (
        <div className="px-5 pb-5 border-t border-gray-100 dark:border-gray-700 pt-4 space-y-3">
          <p className="text-sm text-gray-600 dark:text-gray-400">{t("mcpSetupInstructions")}</p>
          <div className="relative">
            <pre className="px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-900 text-sm text-gray-900 dark:text-gray-100 font-mono overflow-x-auto">{mcpConfig}</pre>
            <CopyButton text={mcpConfig} />
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400">{t("mcpSetupAuth")}</p>
          <div className="text-xs text-gray-500 dark:text-gray-400 space-y-2">
            <p className="font-medium text-gray-700 dark:text-gray-300">{t("mcpSetupToolsTitle")}</p>
            <ul className="list-disc pl-4 space-y-0.5">
              <li><span className="font-mono text-gray-600 dark:text-gray-300">import_profile_data</span> — {t("mcpToolImport")}</li>
              <li><span className="font-mono text-gray-600 dark:text-gray-300">get_schema</span> — {t("mcpToolSchema")}</li>
              <li><span className="font-mono text-gray-600 dark:text-gray-300">add_result</span> — {t("mcpToolAddResult")}</li>
              <li><span className="font-mono text-gray-600 dark:text-gray-300">get_profile</span> — {t("mcpToolGetProfile")}</li>
              <li><span className="font-mono text-gray-600 dark:text-gray-300">get_trends</span> — {t("mcpToolTrends")}</li>
              <li><span className="font-mono text-gray-600 dark:text-gray-300">get_analysis_prompt</span> — {t("mcpToolAnalysis")}</li>
            </ul>
            <p className="text-gray-400 dark:text-gray-500">{t("mcpToolsMore")}</p>
          </div>
        </div>
      )}
    </div>
  );
}
