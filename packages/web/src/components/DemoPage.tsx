import type { Lang } from "@openmarkers/db";
import { enrichUserData } from "@openmarkers/db/src/enrich";
import { useQuery } from "@tanstack/react-query";
import { X } from "lucide-react";
import { useCallback, useMemo } from "react";

import { Button } from "@/components/ui/button";
import {
  SidebarProvider,
  SidebarInset,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { TooltipProvider } from "@/components/ui/tooltip";

import { makeI18n } from "../i18n.ts";
import type { UserData, Route } from "../types.ts";
import CategoryView from "./CategoryView.tsx";
import ComparisonView from "./ComparisonView.tsx";
import Dashboard from "./Dashboard.tsx";
import Loading from "./Loading.tsx";
import Sidebar from "./Sidebar.tsx";
import TimelineView from "./TimelineView.tsx";

interface DemoPageProps {
  route: Route;
  lang: Lang;
  onChangeLang: (lang: Lang) => void;
  isDark: boolean;
  onToggleTheme: () => void;
  navigateTo: (path: string) => void;
}

export default function DemoPage({
  route,
  lang,
  onChangeLang,
  isDark,
  onToggleTheme,
  navigateTo,
}: DemoPageProps) {
  const i18n = useMemo(() => makeI18n(lang), [lang]);

  const { data: demoData } = useQuery<UserData>({
    queryKey: ["demo"],
    queryFn: () =>
      import("../../data/demo.json").then((m) =>
        enrichUserData(m.default as UserData),
      ),
    staleTime: Infinity,
  });

  const navigate = useCallback(
    (target: string | null) => {
      if (target === null) {
        navigateTo("/demo");
      } else if (target === "timeline" || target === "compare") {
        navigateTo(`/demo/${target}`);
      } else {
        navigateTo(`/demo/category/${target}`);
      }
    },
    [navigateTo],
  );

  if (!demoData) return <Loading visible={true} text={i18n.t("loading")} />;

  const category =
    route.view === "category"
      ? demoData.categories.find((c) => c.id === route.id)
      : null;

  return (
    <TooltipProvider>
      <Loading visible={false} />
      <SidebarProvider className="overflow-x-hidden">
        <Sidebar
          categories={demoData.categories}
          activeRoute={route}
          onNavigate={navigate}
          isDark={isDark}
          onToggleTheme={onToggleTheme}
          lang={lang}
          onChangeLang={onChangeLang}
          i18n={i18n}
          profiles={[]}
          activeProfileIdx={0}
          onChangeProfile={() => {}}
          isDemo={true}
        />
        <SidebarInset className="min-w-0 overflow-x-hidden pt-[37px]">
          <div className="fixed top-0 right-0 left-[var(--sidebar-width)] z-40 flex items-center justify-center gap-3 bg-amber-50 dark:bg-amber-950/50 border-b border-amber-200 dark:border-amber-800/50 px-4 py-2 text-sm text-amber-800 dark:text-amber-200 max-md:left-0">
            <span>{i18n.t("demoMode")}</span>
            <Button
              variant="outline"
              size="xs"
              onClick={() => navigateTo("/")}
              className="border-amber-300 dark:border-amber-700 text-amber-800 dark:text-amber-200 hover:bg-amber-100 dark:hover:bg-amber-900/50"
            >
              <X className="w-3 h-3" />
              {i18n.t("exitDemo")}
            </Button>
          </div>
          <header className="md:hidden sticky top-[37px] bg-background border-b px-4 py-3 flex items-center z-30">
            <SidebarTrigger className="mr-3" />
            <h1 className="text-lg font-bold">OpenMarkers</h1>
          </header>
          <div className="p-4 md:p-6 lg:p-8 max-w-7xl mx-auto min-w-0 w-full">
            {route.view === "category" && category ? (
              <CategoryView category={category} isDark={isDark} i18n={i18n} />
            ) : route.view === "timeline" ? (
              <TimelineView categories={demoData.categories} i18n={i18n} />
            ) : route.view === "compare" ? (
              <ComparisonView categories={demoData.categories} i18n={i18n} />
            ) : (
              <Dashboard
                userData={demoData}
                categories={demoData.categories}
                onNavigate={navigate}
                isDark={isDark}
                lang={lang}
                i18n={i18n}
              />
            )}
          </div>
        </SidebarInset>
      </SidebarProvider>
    </TooltipProvider>
  );
}
