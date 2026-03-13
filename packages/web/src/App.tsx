import { useState, useEffect, useCallback, useMemo } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { makeI18n } from "./i18n.ts";
import { authClient } from "./lib/auth-client.ts";
import { setTokenProvider, setOnUnauthorized } from "./lib/api.ts";
import AuthPage from "./components/AuthPage.tsx";
import DemoPage from "./components/DemoPage.tsx";
import DashboardPage from "./components/DashboardPage.tsx";
import Loading from "./components/Loading.tsx";
import PrivacyPolicy from "./components/PrivacyPolicy.tsx";
import TermsOfService from "./components/TermsOfService.tsx";
import PublicProfile from "./components/PublicProfile.tsx";
import PublicProfilesList from "./components/PublicProfilesList.tsx";
import type { Route } from "./types.ts";
import { isLang } from "./lib/utils.ts";
import type { Lang } from "@openmarkers/db";
import { track, Event } from "./lib/analytics.ts";

function getInitialTheme(): "dark" | "light" {
  return document.documentElement.classList.contains("dark") ? "dark" : "light";
}

function getRouteFromPath(): Route {
  const path = window.location.pathname;
  if (path === "/privacy") return { view: "privacy" };
  if (path === "/terms") return { view: "terms" };
  const publicMatch = path.match(/^\/p\/([^/]+)$/);
  if (publicMatch) return { view: "public-profile", id: decodeURIComponent(publicMatch[1]) };
  if (path === "/profiles") return { view: "profiles" };
  const isDemo = path.startsWith("/demo");
  const prefix = isDemo ? "/demo" : "/dashboard";
  if (path === `${prefix}/timeline`) return { view: "timeline", isDemo };
  if (path === `${prefix}/compare`) return { view: "compare", isDemo };
  if (path === `${prefix}/settings`) return { view: "settings", isDemo };
  if (path === `${prefix}/new-profile`) return { view: "new-profile", isDemo };
  const match = path.match(new RegExp(`^${prefix}/category/(.+)$`));
  if (match) return { view: "category", id: decodeURIComponent(match[1]), isDemo };
  if (path.startsWith(prefix)) return { view: "dashboard", isDemo };
  return { view: "home" };
}

setTokenProvider(async () => {
  try {
    const session = await authClient.getSession();
    return session?.data?.session?.token ?? null;
  } catch {
    return null;
  }
});

export default function App() {
  const queryClient = useQueryClient();
  const [theme, setTheme] = useState(getInitialTheme);
  const [lang, setLang] = useState<Lang>(() => {
    const saved = localStorage.getItem("lang");
    return isLang(saved) ? saved : "en";
  });
  const [route, setRoute] = useState(getRouteFromPath);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [authEmail, setAuthEmail] = useState<string | null>(null);

  const i18n = useMemo(() => makeI18n(lang), [lang]);
  const isDark = theme === "dark";

  useEffect(() => {
    setOnUnauthorized(() => {
      setIsAuthenticated(false);
      setAuthEmail(null);
      localStorage.removeItem("wasAuthenticated");
    });
  }, []);

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

  useEffect(() => {
    const onPopState = () => setRoute(getRouteFromPath());
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);

  const navigateTo = useCallback((path: string) => {
    history.pushState(null, "", path);
    setRoute(getRouteFromPath());
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme((prev) => {
      const next = prev === "dark" ? "light" : "dark";
      track(Event.ThemeToggled, { theme: next });
      document.documentElement.classList.add("theme-transition");
      document.documentElement.classList.toggle("dark");
      localStorage.theme = next;
      setTimeout(() => document.documentElement.classList.remove("theme-transition"), 200);
      return next;
    });
  }, []);

  const changeLang = useCallback((l: Lang) => {
    track(Event.LanguageChanged, { lang: l });
    localStorage.setItem("lang", l);
    setLang(l);
  }, []);

  const startDemo = useCallback(() => {
    track(Event.DemoStarted);
    navigateTo("/demo");
  }, [navigateTo]);

  const handleSignOut = useCallback(() => {
    setIsAuthenticated(false);
    setAuthEmail(null);
    localStorage.removeItem("activeProfileId");
    localStorage.removeItem("wasAuthenticated");
    queryClient.clear();
  }, [queryClient]);

  // Static pages
  if (route.view === "privacy") return <PrivacyPolicy onBack={() => window.history.back()} />;
  if (route.view === "terms") return <TermsOfService onBack={() => window.history.back()} />;
  if (route.view === "public-profile" && route.id) return <PublicProfile handle={route.id} />;
  if (route.view === "profiles") return <PublicProfilesList />;

  // Auth page
  if (route.view === "home") {
    return (
      <AuthPage
        onAuthenticated={() => {
          authClient.getSession().then((result) => {
            setIsAuthenticated(true);
            setAuthEmail(result?.data?.user?.email ?? null);
            localStorage.setItem("wasAuthenticated", "1");
            navigateTo("/dashboard");
          });
        }}
        onDemo={startDemo}
        i18n={i18n}
        lang={lang}
        onChangeLang={changeLang}
        isDark={isDark}
        onToggleTheme={toggleTheme}
        isAuthenticated={isAuthenticated === true}
      />
    );
  }

  // Demo page
  if (route.isDemo) {
    return (
      <DemoPage
        route={route}
        lang={lang}
        onChangeLang={changeLang}
        isDark={isDark}
        onToggleTheme={toggleTheme}
        navigateTo={navigateTo}
      />
    );
  }

  // Auth guard
  if (isAuthenticated === null) return <Loading visible={true} text={i18n.t("loading")} />;
  if (isAuthenticated !== true) {
    navigateTo("/");
    return null;
  }

  // Authenticated dashboard
  return (
    <DashboardPage
      route={route}
      lang={lang}
      onChangeLang={changeLang}
      isDark={isDark}
      onToggleTheme={toggleTheme}
      navigateTo={navigateTo}
      authEmail={authEmail}
      onSignOut={handleSignOut}
    />
  );
}
