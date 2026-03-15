import type { Lang } from "@openmarkers/db";
import {
  LineChart,
  HeartPulse,
  FlaskConical,
  Loader2,
  Bot,
  ShieldCheck,
  Github,
  Play,
  Globe,
  ArrowRight,
  Terminal,
  Copy,
  Check,
} from "lucide-react";
import { useState, useEffect } from "react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

import { track, Event } from "../lib/analytics";
import { api } from "../lib/api";
import { authClient } from "../lib/auth-client";
import { errorMessage } from "../lib/utils";
import type { I18n } from "../types";
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

  useEffect(() => {
    api
      .listPublicProfiles()
      .then(setProfiles)
      .catch(() => setProfiles([]));
  }, []);

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

  const features = [
    { icon: LineChart, label: t("featureChartsTitle") },
    { icon: HeartPulse, label: t("featureBioAgeTitle") },
    { icon: FlaskConical, label: t("featureBiomarkersTitle") },
    { icon: Bot, label: t("featureAiTitle") },
    { icon: ShieldCheck, label: t("featurePrivacyTitle") },
    { icon: Globe, label: t("shareProfile") },
  ];

  const ready = profiles !== null && isAuthenticated !== undefined;

  return (
    <div className="min-h-screen bg-background flex flex-col relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
        <div className="absolute -top-24 -right-24 w-[600px] h-[600px] rounded-full bg-emerald-200/30 dark:bg-emerald-400/5 blur-[100px]" />
        <div className="absolute top-1/3 -left-32 w-[500px] h-[500px] rounded-full bg-violet-200/50 dark:bg-violet-400/5 blur-[100px]" />
        <div className="absolute -bottom-20 right-1/4 w-[450px] h-[450px] rounded-full bg-sky-200/50 dark:bg-blue-400/4 blur-[100px]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,_var(--color-border)_1px,_transparent_0)] [background-size:32px_32px] opacity-[0.3] dark:opacity-[0.07]" />
      </div>

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

      <main className="relative flex-1 flex items-center justify-center px-5 py-10 sm:py-16">
        <div className="w-full max-w-5xl">
          <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-start">
            <div className="lg:sticky lg:top-20">
              <div className="inline-flex items-center gap-1.5 text-[11px] text-emerald-600 dark:text-emerald-400 font-medium mb-5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                {t("heroBadgeOpenSource")}
              </div>

              <h1 className="text-3xl sm:text-4xl font-bold text-foreground tracking-tight leading-[1.15]">
                {t("heroSubtitle")}
              </h1>

              <p className="mt-3 text-sm text-muted-foreground leading-relaxed max-w-md">
                {t("featureChartsDesc")}
              </p>

              <div className="mt-5 flex flex-wrap gap-1.5">
                {features.map((f) => (
                  <div
                    key={f.label}
                    className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-muted/60 text-xs text-muted-foreground"
                  >
                    <f.icon className="w-3 h-3" />
                    {f.label}
                  </div>
                ))}
              </div>

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

              <div className="mt-6 space-y-3">
                <div className="flex items-start gap-2.5 text-xs text-muted-foreground/80 dark:text-muted-foreground/60">
                  <Bot className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                  <div>
                    <p>{t("heroMcpDesc")}</p>
                    <button
                      onClick={() =>
                        copyText("https://openmarkers.com/mcp", "mcp")
                      }
                      className="mt-1 flex items-center gap-1.5 group/copy"
                    >
                      <code className="text-[11px] text-muted-foreground/60 dark:text-muted-foreground/40 font-mono">
                        https://openmarkers.com/mcp
                      </code>
                      {copied === "mcp" ? (
                        <Check className="w-3 h-3 text-emerald-500" />
                      ) : (
                        <Copy className="w-3 h-3 opacity-0 group-hover/copy:opacity-60 transition-opacity" />
                      )}
                    </button>
                  </div>
                </div>
                <div className="flex items-start gap-2.5 text-xs text-muted-foreground/80 dark:text-muted-foreground/60">
                  <Terminal className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                  <div>
                    <p>
                      {t("heroCliDesc")
                        .split("{openClawLink}")
                        .map((part, i) =>
                          i === 0 ? (
                            part
                          ) : (
                            <span key={i}>
                              <a
                                href="https://openclaw.ai/"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-foreground/70 hover:text-foreground underline underline-offset-2 transition-colors"
                              >
                                OpenClaw
                              </a>
                              {part}
                            </span>
                          ),
                        )}
                    </p>
                    <button
                      onClick={() =>
                        copyText(
                          "brew install nezdemkovski/tap/openmarkers",
                          "cli",
                        )
                      }
                      className="mt-1 flex items-center gap-1.5 group/copy"
                    >
                      <code className="text-[11px] text-muted-foreground/60 dark:text-muted-foreground/40 font-mono">
                        brew install nezdemkovski/tap/openmarkers
                      </code>
                      {copied === "cli" ? (
                        <Check className="w-3 h-3 text-emerald-500" />
                      ) : (
                        <Copy className="w-3 h-3 opacity-0 group-hover/copy:opacity-60 transition-opacity" />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-border/60 dark:border-border/40 bg-card overflow-hidden flex flex-col max-h-[min(70vh,560px)] min-h-[280px]">
              {!ready ? (
                <div className="flex-1 flex items-center justify-center">
                  <Loader2 className="w-6 h-6 text-muted-foreground/50 dark:text-muted-foreground/40 animate-spin" />
                </div>
              ) : (
                <div className="flex flex-col flex-1 min-h-0 animate-in fade-in duration-300">
                  <div className="flex items-center justify-between px-4 py-3 border-b border-border/60 dark:border-border/30 shrink-0">
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
                    <div className="overflow-y-auto flex-1 min-h-0">
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
                    </div>
                  ) : (
                    <div className="flex-1 flex items-center justify-center p-8">
                      <p className="text-xs text-muted-foreground/40 text-center">
                        {t("openProfilesDesc")}
                      </p>
                    </div>
                  )}

                  {!isAuthenticated && (
                    <button
                      onClick={() => openAuth("signup")}
                      className="shrink-0 border-t border-border/60 dark:border-border/30 px-4 py-2.5 flex items-center justify-between gap-3 hover:bg-muted/30 transition-colors"
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
        </div>
      </main>

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
