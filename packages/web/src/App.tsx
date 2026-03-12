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
import { TooltipProvider } from "@/components/ui/tooltip";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from "@/components/ui/collapsible";
import { DatePicker } from "@/components/ui/date-picker";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
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

interface ImportData {
  user: { name: string };
  [key: string]: unknown;
}
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

  const navigate = useCallback(
    (target: string | null) => {
      if (target === null) {
        navigateTo("/");
      } else if (target === "timeline" || target === "compare" || target === "settings") {
        navigateTo(`/${target}`);
      } else {
        navigateTo(`/category/${target}`);
      }
    },
    [navigateTo],
  );

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
        import("../data/demo.json").then(({ default: data }) => {
          setDemoData(data);
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

  const switchToProfile = useCallback(
    (profileId: number) => {
      queryClient.invalidateQueries({ queryKey: ["profiles"] });
      queryClient.invalidateQueries({ queryKey: ["profile", profileId] });
      setActiveProfileId(profileId);
      localStorage.setItem("activeProfileId", String(profileId));
      setIsDemo(false);
      navigateTo("/");
    },
    [queryClient, navigateTo],
  );

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
    api
      .importProfile(data)
      .then(async (r) => {
        setImportPending(null);
        const pd = await api.getProfile(r.profile_id);
        queryClient.setQueryData(["profile", r.profile_id], pd);
        await queryClient.invalidateQueries({ queryKey: ["profiles"] });
        setActiveProfileId(r.profile_id);
        localStorage.setItem("activeProfileId", String(r.profile_id));
        setIsDemo(false);
        setImporting(false);
        navigateTo("/");
      })
      .catch(() => setImporting(false));
  }, [importPending, importName, queryClient, navigateTo]);

  const changeLang = useCallback((l: Lang) => {
    localStorage.setItem("lang", l);
    setLang(l);
  }, []);

  const sidebarNavigate = useCallback(
    (id: string | null) => {
      navigate(id);
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

  const handleExportProfile = useCallback(
    (profileId: number) => {
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
    },
    [profileList],
  );

  const handleProfilesReordered = useCallback(
    (profileIds: number[]) => {
      api.reorderProfiles(profileIds).then(() => {
        queryClient.invalidateQueries({ queryKey: ["profiles"] });
      });
    },
    [queryClient],
  );

  const handleProfileDeleted = useCallback(
    (profileId: number) => {
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
    },
    [queryClient, profileList, activeProfileId],
  );

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
    <TooltipProvider>
      <Loading visible={false} />
      <SidebarProvider className="overflow-x-hidden">
        <Sidebar
          categories={displayData.categories}
          activeRoute={route}
          onNavigate={sidebarNavigate}
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
          onAddLabVisit={
            activeProfileId != null && !isDemo ? () => setAddLabVisitProfileId(activeProfileId) : undefined
          }
          authEmail={authEmail}
          onSignOut={handleSignOut}
        />
        <SidebarInset className="min-w-0 overflow-x-hidden">
          <header className="md:hidden sticky top-0 bg-background border-b px-4 py-3 flex items-center z-30">
            <SidebarTrigger className="mr-3" />
            <h1 className="text-lg font-bold">OpenMarkers</h1>
          </header>
          <div className="p-4 md:p-6 lg:p-8 max-w-7xl mx-auto min-w-0 w-full">
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
              <CategoryView
                category={category}
                isDark={isDark}
                i18n={i18n}
                profileId={isDemo ? undefined : (activeProfileId ?? undefined)}
                onMutate={isDemo ? undefined : handleResultMutate}
              />
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
        </SidebarInset>
      </SidebarProvider>
      <Dialog
        open={!!importPending}
        onOpenChange={(open) => {
          if (!open) setImportPending(null);
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{i18n.t("importConflictTitle")}</DialogTitle>
            <DialogDescription>
              {importPending ? i18n.t("importConflictMessage").replace("{name}", importPending.name) : ""}
            </DialogDescription>
          </DialogHeader>
          <Input type="text" value={importName} onChange={(e) => setImportName(e.target.value)} />
          <DialogFooter>
            <Button variant="ghost" onClick={() => setImportPending(null)}>
              {i18n.t("importCancel")}
            </Button>
            <Button onClick={confirmImport} disabled={!importName.trim()}>
              {i18n.t("importRename")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
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
    </TooltipProvider>
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
        <h2 className="text-2xl font-bold text-foreground">{t(hasActiveProfile ? "addYourData" : "allResults")}</h2>
        <p className="text-sm text-muted-foreground mt-1">
          {t(hasActiveProfile ? "addYourDataDesc" : "getStartedDesc")}
        </p>
      </div>

      <div className="space-y-3">
        {/* Add lab visit — only when profile exists */}
        {hasActiveProfile && (
          <Button
            variant="outline"
            onClick={() => onAddLabVisit(activeProfileId)}
            className="w-full flex items-center gap-4 rounded-xl p-5 h-auto shadow-sm hover:border-ring text-left"
          >
            <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center shrink-0">
              <svg
                className="w-5 h-5 text-foreground"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
            </div>
            <div>
              <div className="text-sm font-semibold text-foreground">{t("addLabVisit")}</div>
              <div className="text-xs text-muted-foreground mt-0.5">{t("addLabVisitDesc")}</div>
            </div>
          </Button>
        )}

        {/* Import data */}
        <ImportButton importing={importing} onClick={handleFileSelect} t={t} />

        {/* Create new profile — only when no profile exists */}
        {!hasActiveProfile && (
          <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
            <Button
              variant="ghost"
              onClick={() => setShowCreate(!showCreate)}
              className="w-full flex items-center gap-4 p-5 h-auto rounded-none text-left"
            >
              <div className="w-10 h-10 rounded-lg bg-green-50 dark:bg-green-900/30 flex items-center justify-center shrink-0">
                <svg
                  className="w-5 h-5 text-green-600 dark:text-green-400"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                </svg>
              </div>
              <div className="flex-1">
                <div className="text-sm font-semibold text-foreground">{t("createProfile")}</div>
                <div className="text-xs text-muted-foreground mt-0.5">{t("createProfileDesc")}</div>
              </div>
              <svg
                className={`w-4 h-4 text-muted-foreground/60 transition-transform ${showCreate ? "rotate-180" : ""}`}
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </Button>
            {showCreate && (
              <form onSubmit={handleCreate} className="px-5 pb-5 space-y-3 border-t border-border pt-4">
                <Input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={t("profileName")}
                  required
                />
                <DatePicker value={dob} onChange={setDob} placeholder={t("dateOfBirth")} />
                <ToggleGroup
                  variant="outline"
                  value={sex ? [sex] : []}
                  onValueChange={(val) => {
                    const picked = (val as string[]).find((v) => v !== sex);
                    if (picked === "M" || picked === "F") setSex(picked);
                  }}
                  className="w-full"
                >
                  <ToggleGroupItem value="M" className="flex-1">
                    {t("sexMale")}
                  </ToggleGroupItem>
                  <ToggleGroupItem value="F" className="flex-1">
                    {t("sexFemale")}
                  </ToggleGroupItem>
                </ToggleGroup>
                {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}
                <Button type="submit" disabled={loading || !name.trim() || !dob} className="w-full">
                  {loading ? "..." : t("createProfile")}
                </Button>
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
    <Button
      variant="outline"
      size="xs"
      onClick={() => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }}
      className="absolute top-2 right-2"
    >
      {copied ? <CheckCheck className="w-3.5 h-3.5 text-green-600" /> : <Copy className="w-3.5 h-3.5" />}
    </Button>
  );
}

function ImportButton({
  importing,
  onClick,
  t,
}: {
  importing: boolean;
  onClick: () => void;
  t: (key: string) => string;
}) {
  return (
    <Button
      variant="outline"
      onClick={onClick}
      disabled={importing}
      className="w-full flex items-center gap-4 rounded-xl p-5 h-auto shadow-sm hover:border-ring text-left"
    >
      <div className="w-10 h-10 rounded-lg bg-green-50 dark:bg-green-900/30 flex items-center justify-center shrink-0">
        {importing ? (
          <svg className="w-5 h-5 text-green-600 dark:text-green-400 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        ) : (
          <svg
            className="w-5 h-5 text-green-600 dark:text-green-400"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
            />
          </svg>
        )}
      </div>
      <div>
        <div className="text-sm font-semibold text-foreground">{importing ? t("importingData") : t("import")}</div>
        <div className="text-xs text-muted-foreground mt-0.5">{t("importDesc")}</div>
      </div>
    </Button>
  );
}

function AiImportSection({ i18n }: { i18n: ReturnType<typeof makeI18n> }) {
  const { t } = i18n;
  const [open, setOpen] = useState(false);

  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
        <CollapsibleTrigger className="w-full flex items-center gap-4 p-5 hover:bg-muted transition-colors text-left">
          <div className="w-10 h-10 rounded-lg bg-purple-50 dark:bg-purple-900/30 flex items-center justify-center shrink-0">
            <svg
              className="w-5 h-5 text-purple-600 dark:text-purple-400"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z"
              />
            </svg>
          </div>
          <div className="flex-1">
            <div className="text-sm font-semibold text-foreground">{t("aiImport")}</div>
            <div className="text-xs text-muted-foreground mt-0.5">{t("aiImportDesc")}</div>
          </div>
          <svg
            className={`w-4 h-4 text-muted-foreground/60 transition-transform ${open ? "rotate-180" : ""}`}
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div className="px-5 pb-5 border-t border-border pt-4 space-y-3">
            <p className="text-sm text-muted-foreground">{t("aiImportInstructions")}</p>
            <div className="relative">
              <pre className="px-3 py-2 rounded-lg border border-border bg-muted text-xs text-foreground/80 font-mono whitespace-pre-wrap max-h-48 overflow-y-auto">
                {AI_PROMPT.trim()}
              </pre>
              <CopyButton text={AI_PROMPT} />
            </div>
            <p className="text-xs text-muted-foreground">{t("aiImportThen")}</p>
            <div className="rounded-lg border border-border bg-muted p-3 space-y-1.5">
              <p className="text-xs font-medium text-foreground/80">{t("schemaTip")}</p>
              <p className="text-xs text-muted-foreground">{t("schemaTipDesc")}</p>
              <div className="relative">
                <pre className="px-3 py-2 rounded-lg border border-border bg-card text-xs text-foreground font-mono">{`"$schema": "${SCHEMA_URL}"`}</pre>
                <CopyButton text={`"$schema": "${SCHEMA_URL}"`} />
              </div>
            </div>
          </div>
        </CollapsibleContent>
      </div>
    </Collapsible>
  );
}

function McpSetupSection({ i18n }: { i18n: ReturnType<typeof makeI18n> }) {
  const { t } = i18n;
  const [open, setOpen] = useState(false);

  const mcpConfig = JSON.stringify(
    {
      openmarkers: {
        type: "http",
        url: "https://openmarkers.app/mcp",
      },
    },
    null,
    2,
  );

  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
        <CollapsibleTrigger className="w-full flex items-center gap-4 p-5 hover:bg-muted transition-colors text-left">
          <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center shrink-0">
            <svg
              className="w-5 h-5 text-muted-foreground"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244"
              />
            </svg>
          </div>
          <div className="flex-1">
            <div className="text-sm font-semibold text-foreground">{t("mcpSetup")}</div>
            <div className="text-xs text-muted-foreground mt-0.5">{t("mcpSetupDesc")}</div>
          </div>
          <svg
            className={`w-4 h-4 text-muted-foreground/60 transition-transform ${open ? "rotate-180" : ""}`}
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div className="px-5 pb-5 border-t border-border pt-4 space-y-3">
            <p className="text-sm text-muted-foreground">{t("mcpSetupInstructions")}</p>
            <div className="relative">
              <pre className="px-3 py-2 rounded-lg border border-border bg-muted text-sm text-foreground font-mono overflow-x-auto">
                {mcpConfig}
              </pre>
              <CopyButton text={mcpConfig} />
            </div>
            <p className="text-sm text-muted-foreground">{t("mcpSetupAuth")}</p>
            <div className="text-xs text-muted-foreground space-y-2">
              <p className="font-medium text-foreground/80">{t("mcpSetupToolsTitle")}</p>
              <ul className="list-disc pl-4 space-y-0.5">
                <li>
                  <span className="font-mono text-muted-foreground">import_profile_data</span> — {t("mcpToolImport")}
                </li>
                <li>
                  <span className="font-mono text-muted-foreground">get_schema</span> — {t("mcpToolSchema")}
                </li>
                <li>
                  <span className="font-mono text-muted-foreground">add_result</span> — {t("mcpToolAddResult")}
                </li>
                <li>
                  <span className="font-mono text-muted-foreground">get_profile</span> — {t("mcpToolGetProfile")}
                </li>
                <li>
                  <span className="font-mono text-muted-foreground">get_trends</span> — {t("mcpToolTrends")}
                </li>
                <li>
                  <span className="font-mono text-muted-foreground">get_analysis_prompt</span> — {t("mcpToolAnalysis")}
                </li>
              </ul>
              <p className="text-muted-foreground/60">{t("mcpToolsMore")}</p>
            </div>
          </div>
        </CollapsibleContent>
      </div>
    </Collapsible>
  );
}
