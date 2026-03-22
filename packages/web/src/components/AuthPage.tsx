import type { Lang } from "@openmarkers/db";
import { enrichUserData } from "@openmarkers/db/src/enrich";
import { useQuery } from "@tanstack/react-query";
import {
  Loader2,
  Github,
  Play,
  Globe,
  ArrowRight,
  Terminal,
  Users,
  Upload,
  Copy,
  Check,
} from "lucide-react";
import { useState, useEffect, useMemo } from "react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "@/components/ui/tabs";
import { TooltipProvider } from "@/components/ui/tooltip";

import { track, Event } from "../lib/analytics";
import { api } from "../lib/api";
import { authClient } from "../lib/auth-client";
import { errorMessage } from "../lib/utils";
import type { I18n, UserData, Biomarker } from "../types";
import ChartCard from "./ChartCard";
import ThemeLangControls from "./ThemeLangControls";

interface AuthPageProps {
  onAuthenticated: () => void;
  onDemo: () => void;
  i18n: I18n;
  lang: Lang;
  onChangeLang: (lang: Lang) => void;
  isDark: boolean;
  onToggleTheme: () => void;
  isAuthenticated?: boolean;
}


function ClaudeIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M16.14 8.65l-4.87 8.44a.38.38 0 01-.66 0L5.74 8.65a.38.38 0 01.33-.57h3.47c.14 0 .26.07.33.19l2.14 3.7 2.14-3.7a.38.38 0 01.33-.19h3.33a.38.38 0 01.33.57z" />
    </svg>
  );
}

function OpenAIIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M22.28 9.37a6.07 6.07 0 00-.52-4.98A6.12 6.12 0 0015.17 1a6.1 6.1 0 00-5.82 4.22A6.07 6.07 0 005.3 6.68a6.12 6.12 0 00-.95 7.08 6.07 6.07 0 00.52 4.98A6.12 6.12 0 0011.46 22a6.1 6.1 0 005.82-4.22 6.07 6.07 0 004.06-1.46 6.12 6.12 0 00.94-7.08v.13zM11.46 20.78a4.56 4.56 0 01-2.93-1.06l.15-.08 4.87-2.81a.79.79 0 00.4-.69v-6.86l2.06 1.19a.07.07 0 01.04.06v5.69a4.59 4.59 0 01-4.59 4.56zM4.12 17a4.56 4.56 0 01-.55-3.07l.15.09 4.87 2.81a.79.79 0 00.79 0l5.95-3.44v2.38a.07.07 0 01-.03.06l-4.92 2.84A4.59 4.59 0 014.12 17zM3.05 8.26a4.56 4.56 0 012.39-2.01V12a.79.79 0 00.4.69l5.95 3.43-2.06 1.19a.07.07 0 01-.07 0L4.74 14.5a4.59 4.59 0 01-1.69-6.24zm15.49 3.6l-5.95-3.44 2.06-1.18a.07.07 0 01.07 0l4.92 2.84a4.58 4.58 0 01-.7 8.28v-5.75a.79.79 0 00-.4-.69v-.06zm2.05-3.1l-.15-.09-4.87-2.81a.79.79 0 00-.79 0L8.83 9.3V6.92a.07.07 0 01.03-.06l4.92-2.84a4.58 4.58 0 016.81 4.74zM7.88 12.51L5.82 11.3a.07.07 0 01-.04-.06V5.55a4.58 4.58 0 017.52-3.52l-.15.08-4.87 2.81a.79.79 0 00-.4.69v6.86l.04.04h-.04zm1.12-2.4l2.65-1.53 2.65 1.53v3.06l-2.65 1.53L9 13.17v-3.06z" />
    </svg>
  );
}

function CursorIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M5.5 3l13 9-5.5 1.5L11.5 19z" />
    </svg>
  );
}

function VSCodeIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M17.58 2L8.26 10.6 4.42 7.52 2 8.7v6.59l2.42 1.2 3.84-3.1L17.58 22 22 20.18V3.82L17.58 2zM4.42 13.52v-3.04l1.85 1.52-1.85 1.52zm13.16 4.28L10.47 12l7.11-5.8v11.6z" />
    </svg>
  );
}

function IntegrationIcons({ label }: { label: string }) {
  const icons = [
    { Icon: ClaudeIcon, name: "Claude" },
    { Icon: OpenAIIcon, name: "ChatGPT" },
    { Icon: CursorIcon, name: "Cursor" },
    { Icon: VSCodeIcon, name: "VS Code" },
    { Icon: Terminal, name: "Terminal" },
  ];
  return (
    <div className="flex items-center gap-2 text-muted-foreground/50 dark:text-muted-foreground/30">
      <span className="text-[11px]">{label}</span>
      <div className="flex items-center gap-1.5">
        {icons.map(({ Icon, name }) => (
          <Icon key={name} className="w-4 h-4" />
        ))}
      </div>
    </div>
  );
}

function CopyableCommand({
  icon,
  label,
  text,
  copied,
  onCopy,
  id,
}: {
  icon: React.ReactNode;
  label: string;
  text: string;
  copied: string | null;
  onCopy: (text: string, id: string) => void;
  id: string;
}) {
  return (
    <button
      onClick={() => onCopy(text, id)}
      className="flex items-center gap-2.5 group/copy rounded-lg border border-border/60 dark:border-border/30 bg-zinc-950 dark:bg-zinc-900 px-3 py-2.5 w-full hover:bg-zinc-900 dark:hover:bg-zinc-800 transition-colors text-left"
    >
      <span className="text-zinc-400 shrink-0">{icon}</span>
      <span className="text-[11px] text-zinc-500 shrink-0 w-20">{label}</span>
      <code className="text-[11px] text-zinc-300 font-mono flex-1 truncate">
        {text}
      </code>
      {copied === id ? (
        <Check className="w-3 h-3 text-emerald-500 shrink-0" />
      ) : (
        <Copy className="w-3 h-3 text-zinc-600 group-hover/copy:text-zinc-400 transition-colors shrink-0" />
      )}
    </button>
  );
}


function CodeBlock({ children, title }: { children: string; title?: string }) {
  return (
    <div className="rounded-xl border border-border/40 dark:border-border/20 bg-zinc-950 dark:bg-zinc-900 overflow-hidden text-sm">
      {title && (
        <div className="px-4 py-2 border-b border-white/5 flex items-center gap-2">
          <div className="flex gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-red-500/60" />
            <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/60" />
            <div className="w-2.5 h-2.5 rounded-full bg-green-500/60" />
          </div>
          <span className="text-[11px] text-zinc-500 ml-1">{title}</span>
        </div>
      )}
      <pre className="p-4 text-[12px] leading-relaxed overflow-x-auto">
        <code className="text-zinc-300">{children}</code>
      </pre>
    </div>
  );
}

function ChatMockup() {
  return (
    <div className="rounded-xl border border-border/60 dark:border-border/40 bg-card p-4 space-y-3">
      <div className="flex gap-2.5">
        <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center text-[10px] font-bold text-muted-foreground shrink-0">
          Y
        </div>
        <div className="rounded-lg bg-muted/60 px-3 py-2 text-xs text-foreground">
          How are my iron levels trending?
        </div>
      </div>
      <div className="flex gap-2.5">
        <div className="w-6 h-6 rounded-full bg-violet-100 dark:bg-violet-900/40 flex items-center justify-center shrink-0">
          <ClaudeIcon className="w-3.5 h-3.5 text-violet-600 dark:text-violet-400" />
        </div>
        <div className="rounded-lg bg-violet-50 dark:bg-violet-950/30 border border-violet-200/50 dark:border-violet-800/30 px-3 py-2 text-xs text-foreground leading-relaxed">
          Your <strong>ferritin</strong> has been declining over the last 3
          tests (45 &rarr; 32 &rarr; 28 &mu;g/L). Still in range but
          trending down at -5.7/month. Consider checking with your doctor
          if this continues.
        </div>
      </div>
    </div>
  );
}

function TerminalMockup() {
  return (
    <div className="rounded-xl border border-border/40 dark:border-border/20 bg-zinc-950 dark:bg-zinc-900 overflow-hidden">
      <div className="px-4 py-2 border-b border-white/5 flex items-center gap-2">
        <div className="flex gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-red-500/60" />
          <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/60" />
          <div className="w-2.5 h-2.5 rounded-full bg-green-500/60" />
        </div>
        <span className="text-[11px] text-zinc-500 ml-1">Terminal</span>
      </div>
      <div className="p-4 font-mono text-[12px] leading-relaxed overflow-x-auto">
        <p className="text-zinc-400">
          <span className="text-emerald-400">$</span> openmarkers trends
        </p>
        <p className="text-zinc-500 mt-2">
          {"Biomarker              Direction  Change   Latest"}
        </p>
        <p className="text-zinc-600">
          {"───────────────────────────────────────────────────"}
        </p>
        <p className="text-zinc-300">
          {"S-CHOL                 "}
          <span className="text-emerald-400">{"down       -8.2%"}</span>
          {"    5.12"}
        </p>
        <p className="text-zinc-300">
          {"P-P-GLU                "}
          <span className="text-zinc-400">{"stable     +1.1%"}</span>
          {"    5.10"}
        </p>
        <p className="text-zinc-300">
          {"S-VITD                 "}
          <span className="text-amber-400">{"down      -12.4%"}</span>
          {"   68.50"}
        </p>
        <p className="mt-3 text-zinc-400">
          <span className="text-emerald-400">$</span> openmarkers bioage
        </p>
        <p className="text-zinc-300 mt-1">
          {"PhenoAge: "}
          <span className="text-emerald-400 font-semibold">34.2</span>
          {"  Chronological: 37  Delta: "}
          <span className="text-emerald-400">-2.8</span>
        </p>
      </div>
    </div>
  );
}


const HERO_BIOMARKER_IDS = ["S-CHOL", "P-P-GLU", "S-VITD"];

function pickHeroBiomarkers(data: UserData): Biomarker[] {
  const all: Biomarker[] = [];
  for (const cat of data.categories) {
    for (const bio of cat.biomarkers) {
      if (HERO_BIOMARKER_IDS.includes(bio.id)) all.push(bio);
    }
  }
  return all.sort(
    (a, b) =>
      HERO_BIOMARKER_IDS.indexOf(a.id) - HERO_BIOMARKER_IDS.indexOf(b.id),
  );
}


export default function AuthPage({
  onAuthenticated,
  onDemo,
  i18n,
  lang,
  onChangeLang,
  isDark,
  onToggleTheme,
  isAuthenticated,
}: AuthPageProps) {
  const { t } = i18n;
  const [authOpen, setAuthOpen] = useState(false);
  const [tab, setTab] = useState<"login" | "signup">("signup");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [consent, setConsent] = useState(false);
  const [profiles, setProfiles] = useState<
    { name: string; handle: string }[] | null
  >(null);
  const [copied, setCopied] = useState<string | null>(null);

  const copyText = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  const { data: demoData } = useQuery<UserData>({
    queryKey: ["demo-hero"],
    queryFn: () =>
      import("../../data/demo.json").then((m) =>
        enrichUserData(m.default as UserData),
      ),
    staleTime: Infinity,
  });

  const heroBiomarkers = useMemo(
    () => (demoData ? pickHeroBiomarkers(demoData) : []),
    [demoData],
  );

  useEffect(() => {
    api
      .listPublicProfiles()
      .then(setProfiles)
      .catch(() => setProfiles([]));
  }, []);

  const ready = profiles !== null && isAuthenticated !== undefined;

  const goToApp = () => {
    history.pushState(null, "", "/dashboard");
    window.dispatchEvent(new PopStateEvent("popstate"));
  };

  const openAuth = (mode: "login" | "signup") => {
    setTab(mode);
    setError("");
    setAuthOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      if (tab === "signup") {
        const result = await authClient.signUp.email({
          email,
          password,
          name: email.split("@")[0],
        });
        if (result.error) {
          setError(result.error.message || "Sign up failed");
          return;
        }
      } else {
        const result = await authClient.signIn.email({ email, password });
        if (result.error) {
          setError(result.error.message || "Sign in failed");
          return;
        }
      }
      track(tab === "signup" ? Event.SignedUp : Event.SignedIn);
      setAuthOpen(false);
      onAuthenticated();
    } catch (err: unknown) {
      setError(errorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
        <div className="absolute -top-24 -right-24 w-[600px] h-[600px] rounded-full bg-emerald-200/30 dark:bg-emerald-400/5 blur-[100px]" />
        <div className="absolute top-1/3 -left-32 w-[500px] h-[500px] rounded-full bg-violet-200/50 dark:bg-violet-400/5 blur-[100px]" />
        <div className="absolute -bottom-20 right-1/4 w-[450px] h-[450px] rounded-full bg-sky-200/50 dark:bg-blue-400/4 blur-[100px]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,_var(--color-border)_1px,_transparent_0)] [background-size:32px_32px] opacity-[0.3] dark:opacity-[0.07]" />
      </div>

      {/* Nav */}
      <nav className="relative bg-background/60 backdrop-blur-xl border-b border-border/60 dark:border-border/30">
        <div className="max-w-5xl mx-auto px-5 lg:px-0 h-12 flex items-center justify-between">
          <span className="text-lg font-bold text-foreground">OpenMarkers</span>
          <div className="flex items-center gap-1">
            <Button
              size="sm"
              onClick={isAuthenticated ? goToApp : () => openAuth("login")}
              className={`mr-1.5 gap-1.5 rounded-full h-7 px-3 text-xs transition-opacity duration-300 ${ready ? "opacity-100" : "opacity-0 pointer-events-none"}`}
            >
              {isAuthenticated ? t("goToApp") : t("authLogin")}
              <ArrowRight className="w-3 h-3" />
            </Button>
            <ThemeLangControls
              isDark={isDark}
              onToggleTheme={onToggleTheme}
              lang={lang}
              onChangeLang={onChangeLang}
            />
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative px-5 lg:min-h-[calc(100dvh-48px)] flex items-center">
        <div className="w-full max-w-5xl mx-auto py-12 sm:py-16 lg:py-0">
          <div className="grid lg:grid-cols-2 gap-10 lg:gap-12 items-center">
            {/* Left: Copy + CTAs */}
            <div>
              <div className="inline-flex items-center gap-1.5 text-[11px] text-emerald-600 dark:text-emerald-400 font-medium mb-5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                {t("heroBadgeOpenSource")}
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-[42px] font-bold text-foreground tracking-tight leading-[1.1]">
                {t("heroH1")}
              </h1>

              <p className="mt-4 text-sm sm:text-base text-muted-foreground leading-relaxed max-w-lg">
                {t("heroDesc")}
              </p>

              <div className="mt-6 flex items-center gap-3">
                <Button
                  variant="outline"
                  onClick={onDemo}
                  className="rounded-full gap-2 text-xs h-8 px-4"
                >
                  <Play className="w-3 h-3" />
                  {t("heroDemoButton")}
                </Button>
                {ready && !isAuthenticated && (
                  <Button
                    onClick={() => openAuth("signup")}
                    className="rounded-full gap-2 text-xs h-8 px-5 animate-in fade-in duration-300"
                  >
                    {t("getStarted")}
                    <ArrowRight className="w-3 h-3" />
                  </Button>
                )}
              </div>

              <div className="mt-6">
                <IntegrationIcons label={t("heroIntegrations")} />
              </div>
            </div>

            {/* Right: Live demo charts */}
            <div className="space-y-3 max-h-[min(72vh,600px)] overflow-y-auto pr-1">
              {heroBiomarkers.length > 0 ? (
                <TooltipProvider>
                  {heroBiomarkers.map((bio) => (
                    <ChartCard
                      key={bio.id}
                      biomarker={bio}
                      isDark={isDark}
                      i18n={i18n}
                    />
                  ))}
                </TooltipProvider>
              ) : (
                <div className="flex items-center justify-center h-64">
                  <Loader2 className="w-6 h-6 text-muted-foreground/40 animate-spin" />
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Use Cases Section */}
      <section className="relative px-5 py-16 sm:py-24">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight text-center mb-14">
            {t("useCasesHeading")}
          </h2>

          {/* Use Case 1: Upload */}
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center mb-16 lg:mb-24">
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-2">
                {t("useCase1Title")}
              </h3>
              <p className="text-sm text-muted-foreground mb-5">
                {t("useCase1Desc")}
              </p>
              {/* Mockup: Upload zone */}
              <div className="rounded-xl border-2 border-dashed border-border/60 dark:border-border/40 p-8 text-center">
                <div className="w-12 h-12 rounded-full bg-emerald-50 dark:bg-emerald-950/30 flex items-center justify-center mx-auto mb-3">
                  <Upload className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                </div>
                <p className="text-sm font-medium text-foreground">
                  {t("uploadDrop")}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {t("uploadFormats")}
                </p>
              </div>
            </div>
            <div>
              {/* Mockup: Review table */}
              <div className="rounded-xl border border-border/60 dark:border-border/40 bg-card overflow-hidden">
                <div className="px-4 py-2.5 border-b border-border/60 dark:border-border/30">
                  <span className="text-xs font-semibold text-foreground">
                    {t("uploadReview")}
                  </span>
                </div>
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-border/30">
                      <th className="text-left text-muted-foreground font-medium px-4 py-1.5">
                        Biomarker
                      </th>
                      <th className="text-left text-muted-foreground font-medium px-4 py-1.5">
                        Value
                      </th>
                    </tr>
                  </thead>
                  <tbody className="text-foreground">
                    {[
                      ["Glucose", "5.2 mmol/l"],
                      ["Cholesterol", "5.8 mmol/l"],
                      ["Hemoglobin", "148 g/l"],
                      ["Creatinine", "82 µmol/l"],
                      ["TSH", "2.1 mIU/l"],
                    ].map(([name, val]) => (
                      <tr
                        key={name}
                        className="border-b border-border/20 last:border-0"
                      >
                        <td className="px-4 py-1.5 font-medium">{name}</td>
                        <td className="px-4 py-1.5 font-mono text-muted-foreground">
                          {val}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Use Case 2: MCP */}
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center mb-16 lg:mb-24">
            <div className="lg:order-2">
              <h3 className="text-lg font-semibold text-foreground mb-2">
                {t("useCase2Title")}
              </h3>
              <p className="text-sm text-muted-foreground mb-5">
                {t("useCase2Desc")}
              </p>
              <div className="space-y-2">
                <CopyableCommand
                  icon={<ClaudeIcon className="w-3.5 h-3.5" />}
                  label="Claude Code"
                  text="claude mcp add --transport http openmarkers https://openmarkers.com/mcp"
                  copied={copied}
                  onCopy={copyText}
                  id="claude-mcp"
                />
                <CopyableCommand
                  icon={<OpenAIIcon className="w-3.5 h-3.5" />}
                  label="Codex"
                  text="codex mcp add openmarkers --url https://openmarkers.com/mcp"
                  copied={copied}
                  onCopy={copyText}
                  id="codex-mcp"
                />
              </div>
              <p className="mt-3 text-[11px] text-muted-foreground/40">
                Or add to your config manually:
              </p>
              <div className="mt-1.5">
                <CodeBlock title="mcp.json">
{`{
  "mcpServers": {
    "openmarkers": {
      "url": "https://openmarkers.com/mcp"
    }
  }
}`}
                </CodeBlock>
              </div>
              <div className="mt-3">
                <IntegrationIcons label={t("heroIntegrations")} />
              </div>
            </div>
            <div className="lg:order-1">
              <ChatMockup />
            </div>
          </div>

          {/* Use Case 3: Trends */}
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            <div className="lg:order-2">
              <h3 className="text-lg font-semibold text-foreground mb-2">
                {t("useCase3Title")}
              </h3>
              <p className="text-sm text-muted-foreground mb-5">
                {t("useCase3Desc")}
              </p>
              <div className="space-y-2 text-xs text-muted-foreground">
                {[
                  t("featureChartsTitle"),
                  t("featureBioAgeTitle"),
                  t("featureBiomarkersTitle"),
                ].map((f) => (
                  <div key={f} className="flex items-center gap-2">
                    <span className="w-1 h-1 rounded-full bg-emerald-500 shrink-0" />
                    {f}
                  </div>
                ))}
              </div>
            </div>
            <div className="lg:order-1">
              {heroBiomarkers.length > 0 ? (
                <TooltipProvider>
                  <ChartCard
                    biomarker={heroBiomarkers[0]}
                    isDark={isDark}
                    i18n={i18n}
                  />
                </TooltipProvider>
              ) : (
                <div className="h-48 rounded-xl border border-border/60 bg-card flex items-center justify-center">
                  <Loader2 className="w-5 h-5 text-muted-foreground/30 animate-spin" />
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Trust Section */}
      <section className="relative px-5 py-16 sm:py-20">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight text-center mb-10">
            {t("trustHeading")}
          </h2>
          <div className="grid sm:grid-cols-3 gap-4">
            <div className="rounded-xl border border-border/60 dark:border-border/40 bg-card p-5">
              <Github className="w-5 h-5 text-foreground/70 mb-3" />
              <h3 className="text-sm font-semibold text-foreground">
                {t("trustOpenSourceTitle")}
              </h3>
              <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                {t("trustOpenSourceDesc")}
              </p>
            </div>
            <div className="rounded-xl border border-border/60 dark:border-border/40 bg-card p-5">
              <Users className="w-5 h-5 text-foreground/70 mb-3" />
              <h3 className="text-sm font-semibold text-foreground">
                {t("trustFamilyTitle")}
              </h3>
              <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                {t("trustFamilyDesc")}
              </p>
            </div>
            <div className="rounded-xl border border-border/60 dark:border-border/40 bg-card p-5">
              <Globe className="w-5 h-5 text-foreground/70 mb-3" />
              <h3 className="text-sm font-semibold text-foreground">
                {t("trustShareTitle")}
              </h3>
              <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                {t("trustShareDesc")}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Open Profiles Section */}
      <section className="relative px-5 py-16 sm:py-20">
        <div className="max-w-5xl mx-auto">
          <div className="rounded-2xl border border-border/60 dark:border-border/40 bg-card overflow-hidden">
            {!ready ? (
              <div className="flex items-center justify-center py-16">
                <Loader2 className="w-6 h-6 text-muted-foreground/40 animate-spin" />
              </div>
            ) : (
              <div className="animate-in fade-in duration-300">
                <div className="flex items-center justify-between px-4 py-3 border-b border-border/60 dark:border-border/30">
                  <div className="flex items-center gap-2">
                    <Globe className="w-3.5 h-3.5 text-muted-foreground/70 dark:text-muted-foreground/50" />
                    <h2 className="text-xs font-semibold text-foreground">
                      {t("openProfiles")}
                    </h2>
                  </div>
                  {profiles!.length > 0 && (
                    <a
                      href="/profiles"
                      className="text-[11px] text-muted-foreground/60 dark:text-muted-foreground/40 hover:text-muted-foreground transition-colors"
                    >
                      {t("viewAll")}
                    </a>
                  )}
                </div>

                {profiles!.length > 0 ? (
                  <table className="w-full">
                    <tbody>
                      {profiles!.map((p, i) => (
                        <tr key={p.handle} className="group">
                          <td className="w-0 pl-4 pr-2 py-2.5">
                            <span className="text-[11px] text-muted-foreground/50 dark:text-muted-foreground/30 tabular-nums font-medium">
                              {i + 1}
                            </span>
                          </td>
                          <td className="py-2.5 pr-2">
                            <a
                              href={`/p/${p.handle}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-2.5"
                            >
                              <div
                                className={`w-7 h-7 rounded-full bg-gradient-to-br ${GRADIENTS[i % GRADIENTS.length]} flex items-center justify-center text-white text-[11px] font-bold shrink-0`}
                              >
                                {p.name.charAt(0).toUpperCase()}
                              </div>
                              <span className="text-sm font-medium text-foreground truncate group-hover:text-foreground/70 transition-colors">
                                {p.name}
                              </span>
                            </a>
                          </td>
                          <td className="py-2.5 pr-4 text-right">
                            <a
                              href={`/p/${p.handle}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-[11px] text-muted-foreground/55 dark:text-muted-foreground/35 font-mono group-hover:text-muted-foreground/80 dark:group-hover:text-muted-foreground/60 transition-colors"
                            >
                              /p/{p.handle}
                            </a>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <div className="py-12 text-center">
                    <p className="text-xs text-muted-foreground/40">
                      {t("openProfilesDesc")}
                    </p>
                  </div>
                )}

                {!isAuthenticated && (
                  <button
                    onClick={() => openAuth("signup")}
                    className="w-full border-t border-border/60 dark:border-border/30 px-4 py-2.5 flex items-center justify-between gap-3 hover:bg-muted/30 transition-colors"
                  >
                    <span className="text-xs text-muted-foreground">
                      {t("getStartedFree")}
                    </span>
                    <ArrowRight className="w-3.5 h-3.5 text-muted-foreground/50 dark:text-muted-foreground/30" />
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/50 dark:border-border/20 py-4">
        <div className="max-w-5xl mx-auto px-5 flex items-center justify-between text-[11px] text-muted-foreground/60 dark:text-muted-foreground/40">
          <span>
            Built by{" "}
            <a
              href="https://github.com/nezdemkovski"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-muted-foreground transition-colors"
            >
              Yuri Nezdemkovski
            </a>
          </span>
          <div className="flex items-center gap-3">
            <a
              href="/privacy"
              className="hover:text-muted-foreground transition-colors"
            >
              Privacy
            </a>
            <a
              href="/terms"
              className="hover:text-muted-foreground transition-colors"
            >
              Terms
            </a>
            <a
              href="https://github.com/nezdemkovski/openmarkers"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-muted-foreground transition-colors inline-flex items-center gap-1"
            >
              <Github className="w-2.5 h-2.5" />
              GitHub
            </a>
          </div>
        </div>
      </footer>

      {/* Auth Dialog */}
      <Dialog open={authOpen} onOpenChange={setAuthOpen}>
        <DialogContent className="sm:max-w-sm p-5 gap-0">
          <Tabs
            value={tab}
            onValueChange={(v) => {
              setTab(v as "login" | "signup");
              setError("");
            }}
          >
            <TabsList className="w-full mb-4">
              <TabsTrigger value="signup">{t("authSignUp")}</TabsTrigger>
              <TabsTrigger value="login">{t("authLogin")}</TabsTrigger>
            </TabsList>

            <TabsContent value="signup">
              <form onSubmit={handleSubmit} className="space-y-2.5">
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={t("authEmail")}
                  required
                  autoComplete="email"
                  className="h-9"
                />
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={t("authPassword")}
                  required
                  minLength={8}
                  autoComplete="new-password"
                  className="h-9"
                />
                <Label className="flex items-start gap-2 text-[11px] text-muted-foreground/70 font-normal leading-tight">
                  <Checkbox
                    checked={consent}
                    onCheckedChange={(c) => setConsent(c === true)}
                    className="mt-px"
                  />
                  <span>{t("authConsent")}</span>
                </Label>
                {error && <p className="text-xs text-destructive">{error}</p>}
                <Button
                  type="submit"
                  disabled={loading || !consent}
                  className="w-full h-9 rounded-xl text-sm font-semibold"
                >
                  {loading ? "..." : t("authSignUp")}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="login">
              <form onSubmit={handleSubmit} className="space-y-2.5">
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={t("authEmail")}
                  required
                  autoComplete="email"
                  className="h-9"
                />
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={t("authPassword")}
                  required
                  minLength={8}
                  autoComplete="current-password"
                  className="h-9"
                />
                {error && <p className="text-xs text-destructive">{error}</p>}
                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full h-9 rounded-xl text-sm font-semibold"
                >
                  {loading ? "..." : t("authLogin")}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
          <p className="text-center text-[10px] text-muted-foreground/40 mt-3">
            {t("authDisclaimer")}
          </p>
        </DialogContent>
      </Dialog>
    </div>
  );
}

const GRADIENTS = [
  "from-emerald-400 to-teal-500",
  "from-blue-400 to-indigo-500",
  "from-violet-400 to-purple-500",
  "from-rose-400 to-pink-500",
  "from-amber-400 to-orange-500",
  "from-cyan-400 to-blue-500",
];
