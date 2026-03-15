import {
  ChevronDown,
  ChevronRight,
  Clock,
  GitCompareArrows,
  FlaskConical,
  Settings,
  LogOut,
  PlusCircle,
  LayoutDashboard,
  Globe,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleTrigger,
  CollapsibleContent,
} from "@/components/ui/collapsible";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  Sidebar as SidebarRoot,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
  SidebarSeparator,
} from "@/components/ui/sidebar";

import type { Category, I18n, Lang, UserData, Route } from "../types.ts";
import ThemeLangControls from "./ThemeLangControls";

function countOutOfRange(category: Category): number {
  let count = 0;
  for (const b of category.biomarkers) {
    if (b.results.length === 0) continue;
    const latest = b.results[b.results.length - 1];
    if (typeof latest.value === "number") {
      if (
        (b.refMin != null && latest.value < b.refMin) ||
        (b.refMax != null && latest.value > b.refMax)
      )
        count++;
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
  isDark: boolean;
  onToggleTheme: () => void;
  lang: Lang;
  onChangeLang: (lang: Lang) => void;
  i18n: I18n;
  profiles: UserData[];
  activeProfileIdx: number;
  onChangeProfile: (idx: number) => void;
  isDemo: boolean;
  onAddLabVisit?: () => void;
  onCreateProfile?: () => void;
  authEmail?: string | null;
  onSignOut?: () => void;
}

export default function Sidebar({
  categories,
  activeRoute,
  onNavigate,
  isDark,
  onToggleTheme,
  lang,
  onChangeLang,
  i18n,
  profiles,
  activeProfileIdx,
  onChangeProfile,
  isDemo,
  onAddLabVisit,
  onCreateProfile,
  authEmail,
  onSignOut,
}: SidebarProps) {
  const { t, tCat } = i18n;
  const activeUser = profiles[activeProfileIdx]?.user;

  return (
    <SidebarRoot>
      <SidebarHeader className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <a
              href="/"
              onClick={(e) => {
                e.preventDefault();
                history.pushState(null, "", "/");
                window.dispatchEvent(new PopStateEvent("popstate"));
              }}
              className="text-lg font-bold text-sidebar-foreground hover:opacity-80"
            >
              {t("appName")}
            </a>
            <p className="text-xs text-sidebar-foreground/50 mt-0.5">
              {t("subtitle")}
            </p>
          </div>
          <ThemeLangControls
            isDark={isDark}
            onToggleTheme={onToggleTheme}
            lang={lang}
            onChangeLang={onChangeLang}
          />
        </div>

        {activeUser ? (
          <div className="mt-2">
            <DropdownMenu>
              <DropdownMenuTrigger className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg hover:bg-sidebar-accent transition-colors">
                <div className="w-8 h-8 rounded-full bg-muted text-muted-foreground flex items-center justify-center text-xs font-bold shrink-0">
                  {getInitials(activeUser.name)}
                </div>
                <div className="flex-1 text-left min-w-0">
                  <div className="text-sm font-medium text-sidebar-foreground truncate">
                    {activeUser.name}
                  </div>
                  {activeUser.publicHandle ? (
                    <div className="text-[11px] text-sidebar-foreground/40 flex items-center gap-1 truncate">
                      <Globe className="w-3 h-3 shrink-0" />
                      /p/{activeUser.publicHandle}
                    </div>
                  ) : activeUser.dateOfBirth ? (
                    <div className="text-xs text-sidebar-foreground/40">
                      {activeUser.dateOfBirth}
                    </div>
                  ) : null}
                </div>
                <ChevronDown className="w-4 h-4 text-sidebar-foreground/40 shrink-0" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" side="bottom">
                {profiles.map((u, idx) => (
                  <DropdownMenuItem
                    key={idx}
                    onClick={() => onChangeProfile(idx)}
                    className={idx === activeProfileIdx ? "bg-accent" : ""}
                  >
                    <div className="w-7 h-7 rounded-full bg-muted text-muted-foreground flex items-center justify-center text-xs font-bold shrink-0">
                      {getInitials(u.user.name)}
                    </div>
                    <div className="min-w-0">
                      <div className="text-sm font-medium text-sidebar-foreground truncate">
                        {u.user.name}
                      </div>
                      {u.user.dateOfBirth && (
                        <div className="text-xs text-sidebar-foreground/40">
                          {u.user.dateOfBirth}
                        </div>
                      )}
                    </div>
                  </DropdownMenuItem>
                ))}
                {onCreateProfile && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={onCreateProfile}>
                      <PlusCircle className="w-4 h-4" />
                      <span>{t("createProfile")}</span>
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
            {onAddLabVisit && (
              <Button
                variant="outline"
                onClick={onAddLabVisit}
                className="w-full mt-2"
              >
                <PlusCircle className="w-4 h-4" />
                {t("addLabVisit")}
              </Button>
            )}
          </div>
        ) : null}
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  isActive={activeRoute.view === "dashboard"}
                  onClick={() => onNavigate(null)}
                >
                  <LayoutDashboard className="w-4 h-4" />
                  <span>{t("viewAll")}</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <Collapsible defaultOpen className="group/collapsible">
                <SidebarMenuItem>
                  <CollapsibleTrigger render={<SidebarMenuButton />}>
                    <FlaskConical className="w-4 h-4" />
                    <span className="capitalize">{t("biomarkers")}</span>
                    <ChevronRight className="ml-auto w-4 h-4 transition-transform group-data-open/collapsible:rotate-90" />
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <SidebarMenuSub className="mx-0 border-l-0 px-0">
                      {categories.map((cat) => {
                        const outCount = countOutOfRange(cat);
                        const isActive =
                          activeRoute.view === "category" &&
                          activeRoute.id === cat.id;
                        return (
                          <SidebarMenuSubItem key={cat.id}>
                            <SidebarMenuSubButton
                              render={<button />}
                              isActive={isActive}
                              onClick={() => onNavigate(cat.id)}
                              className="w-full justify-between h-auto py-1.5 overflow-visible pl-8 rounded-none"
                            >
                              <span className="flex-1 text-left">
                                {tCat(cat.id, "name")}
                              </span>
                              {outCount > 0 ? (
                                <Badge
                                  variant="destructive"
                                  className="shrink-0 ml-auto"
                                >
                                  {outCount}
                                </Badge>
                              ) : (
                                <Badge
                                  variant="success"
                                  className="shrink-0 ml-auto"
                                >
                                  {t("ok")}
                                </Badge>
                              )}
                            </SidebarMenuSubButton>
                          </SidebarMenuSubItem>
                        );
                      })}
                    </SidebarMenuSub>
                  </CollapsibleContent>
                </SidebarMenuItem>
              </Collapsible>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <SidebarSeparator />
        <SidebarMenu>
          {categories.length > 0 && (
            <>
              <SidebarMenuItem>
                <SidebarMenuButton
                  isActive={activeRoute.view === "timeline"}
                  onClick={() => onNavigate("timeline")}
                >
                  <Clock className="w-4 h-4" />
                  <span>{t("timeline")}</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  isActive={activeRoute.view === "compare"}
                  onClick={() => onNavigate("compare")}
                >
                  <GitCompareArrows className="w-4 h-4" />
                  <span>{t("comparison")}</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </>
          )}
          {!isDemo && (
            <SidebarMenuItem>
              <SidebarMenuButton
                isActive={activeRoute.view === "settings"}
                onClick={() => onNavigate("settings")}
              >
                <Settings className="w-4 h-4" />
                <span>{t("settings")}</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          )}
          {onSignOut && (
            <>
              {authEmail && (
                <div className="px-2.5 py-1 text-xs text-sidebar-foreground/40 truncate">
                  {authEmail}
                </div>
              )}
              <SidebarMenuItem>
                <SidebarMenuButton
                  onClick={onSignOut}
                  className="text-sidebar-foreground/60"
                >
                  <LogOut className="w-4 h-4" />
                  <span>{t("authSignOut") || "Sign Out"}</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </>
          )}
        </SidebarMenu>
      </SidebarFooter>
    </SidebarRoot>
  );
}
