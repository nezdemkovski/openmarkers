import { useState, useEffect } from "react";
import { authClient } from "../lib/auth-client";
import { api } from "../lib/api";
import {
  LineChart,
  HeartPulse,
  FlaskConical,
  Bot,
  ShieldCheck,
  Github,
  Play,
  Languages,
  Sun,
  Moon,
  Globe,
} from "lucide-react";
import { LANGS } from "../i18n";
import { errorMessage } from "../lib/utils";
import type { I18n } from "../types";
import type { Lang } from "@openmarkers/db";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

interface AuthPageProps {
  onAuthenticated: () => void;
  onDemo: () => void;
  i18n: I18n;
  lang: Lang;
  onChangeLang: (lang: Lang) => void;
  isDark: boolean;
  onToggleTheme: () => void;
}

export default function AuthPage({
  onAuthenticated,
  onDemo,
  i18n,
  lang,
  onChangeLang,
  isDark,
  onToggleTheme,
}: AuthPageProps) {
  const { t } = i18n;
  const [tab, setTab] = useState<"login" | "signup">("signup");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [consent, setConsent] = useState(false);

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
      onAuthenticated();
    } catch (err: unknown) {
      setError(errorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Language selector */}
      <div className="absolute top-4 right-4 flex items-center gap-3 text-muted-foreground/60">
        <Button variant="ghost" size="icon-sm" onClick={onToggleTheme}>
          {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </Button>
        <div className="flex items-center gap-1.5">
          <Languages className="w-4 h-4" />
          <Select value={lang} onValueChange={(v) => onChangeLang(v as Lang)}>
            <SelectTrigger className="h-auto border-none bg-transparent px-1 py-0 text-xs text-muted-foreground dark:bg-transparent dark:hover:bg-transparent focus-visible:ring-0 focus-visible:border-transparent">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {LANGS.map((l) => (
                <SelectItem key={l.code} value={l.code}>
                  {l.nativeName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-12 md:py-20">
        {/* Hero */}
        <div className="text-center mb-10 md:mb-14">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground tracking-tight">OpenMarkers</h1>
          <p className="mt-3 text-lg md:text-xl text-muted-foreground max-w-xl mx-auto">{t("heroSubtitle")}</p>
          <div className="mt-4 flex items-center justify-center gap-4 text-xs text-muted-foreground/60">
            <span className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              {t("heroBadgeOpenSource")}
            </span>
            <span className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-primary" />
              {t("heroBadgeBiomarkers")}
            </span>
            <span className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-violet-500" />
              {t("heroBadgeMcp")}
            </span>
          </div>
        </div>

        {/* Demo CTA — most prominent action */}
        <div className="max-w-md mx-auto mb-10 md:mb-14">
          <Button
            onClick={onDemo}
            className="w-full py-3 px-5 h-auto rounded-xl bg-violet-600 dark:bg-violet-600 text-white font-medium hover:bg-violet-700 dark:hover:bg-violet-500 shadow-sm"
          >
            <Play className="w-4 h-4" />
            {t("heroDemoButton")}
          </Button>
        </div>

        {/* Main content: features + form */}
        <div className="grid md:grid-cols-2 gap-10 md:gap-16 items-start">
          {/* Left: features */}
          <div className="space-y-6">
            <Feature
              icon={<LineChart className="w-5 h-5" />}
              title={t("featureChartsTitle")}
              desc={t("featureChartsDesc")}
              color="blue"
            />
            <Feature
              icon={<HeartPulse className="w-5 h-5" />}
              title={t("featureBioAgeTitle")}
              desc={t("featureBioAgeDesc")}
              color="rose"
            />
            <Feature
              icon={<FlaskConical className="w-5 h-5" />}
              title={t("featureBiomarkersTitle")}
              desc={t("featureBiomarkersDesc")}
              color="emerald"
            />
            <Feature
              icon={<Bot className="w-5 h-5" />}
              title={t("featureAiTitle")}
              desc={t("featureAiDesc")}
              color="violet"
            />
            <Feature
              icon={<ShieldCheck className="w-5 h-5" />}
              title={t("featurePrivacyTitle")}
              desc={t("featurePrivacyDesc")}
              color="amber"
            />
          </div>

          {/* Right: auth form */}
          <div className="space-y-4">
            <div className="bg-card rounded-xl shadow-sm border border-border p-6 space-y-4">
              <Tabs
                value={tab}
                onValueChange={(v) => {
                  setTab(v as "login" | "signup");
                  setError("");
                }}
              >
                <TabsList className="w-full">
                  <TabsTrigger value="signup">{t("authSignUp") || "Sign Up"}</TabsTrigger>
                  <TabsTrigger value="login">{t("authLogin") || "Log In"}</TabsTrigger>
                </TabsList>

                <TabsContent value="signup">
                  <form onSubmit={handleSubmit} className="space-y-3">
                    <div>
                      <Input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder={t("authEmail") || "Email"}
                        required
                        autoComplete="email"
                      />
                    </div>
                    <div>
                      <Input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder={t("authPassword") || "Password"}
                        required
                        minLength={8}
                        autoComplete="new-password"
                      />
                    </div>

                    <Label className="flex items-start gap-2 text-xs text-muted-foreground font-normal">
                      <Checkbox
                        checked={consent}
                        onCheckedChange={(checked) => setConsent(checked === true)}
                        className="mt-0.5"
                      />
                      <span>{t("authConsent") || "I agree to store my blood test results and lab data"}</span>
                    </Label>

                    {error && <p className="text-sm text-destructive">{error}</p>}

                    <Button type="submit" disabled={loading || !consent} className="w-full h-9">
                      {loading ? "..." : t("authSignUp") || "Sign Up"}
                    </Button>
                  </form>
                </TabsContent>

                <TabsContent value="login">
                  <form onSubmit={handleSubmit} className="space-y-3">
                    <div>
                      <Input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder={t("authEmail") || "Email"}
                        required
                        autoComplete="email"
                      />
                    </div>
                    <div>
                      <Input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder={t("authPassword") || "Password"}
                        required
                        minLength={8}
                        autoComplete="current-password"
                      />
                    </div>

                    {error && <p className="text-sm text-destructive">{error}</p>}

                    <Button type="submit" disabled={loading} className="w-full h-9">
                      {loading ? "..." : t("authLogin") || "Log In"}
                    </Button>
                  </form>
                </TabsContent>
              </Tabs>
            </div>

            <div className="text-center text-xs text-muted-foreground/60 space-y-1">
              <p>{t("authDisclaimer") || "This is not a medical device or healthcare service. Not medical advice."}</p>
              <p>
                <a href="/privacy" className="hover:underline">
                  Privacy Policy
                </a>
                {" · "}
                <a href="/terms" className="hover:underline">
                  Terms of Service
                </a>
                {" · "}
                <a
                  href="https://github.com/nezdemkovski/openmarkers"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:underline inline-flex items-center gap-1"
                >
                  <Github className="w-3 h-3" />
                  GitHub
                </a>
              </p>
            </div>
          </div>
        </div>

        <PublicProfilesDirectory t={t} />
      </div>
    </div>
  );
}

function PublicProfilesDirectory({ t }: { t: (key: string) => string }) {
  const [profiles, setProfiles] = useState<{ name: string; handle: string }[]>([]);

  useEffect(() => {
    api.listPublicProfiles().then(setProfiles).catch(() => {});
  }, []);

  if (profiles.length === 0) return null;

  return (
    <div className="mt-14 md:mt-20">
      <div className="text-center mb-6">
        <h2 className="text-xl font-bold text-foreground flex items-center justify-center gap-2">
          <Globe className="w-5 h-5 text-emerald-500" />
          {t("openProfiles")}
        </h2>
        <p className="text-sm text-muted-foreground mt-1">{t("openProfilesDesc")}</p>
      </div>
      <div className="flex flex-wrap justify-center gap-3">
        {profiles.map((p) => (
          <a
            key={p.handle}
            href={`/p/${p.handle}`}
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg border border-border bg-card hover:bg-muted transition-colors shadow-sm"
          >
            <div className="w-8 h-8 rounded-full bg-emerald-50 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 text-sm font-bold">
              {p.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <div className="text-sm font-medium text-foreground">{p.name}</div>
              <div className="text-xs text-muted-foreground">/{p.handle}</div>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}

const colorMap = {
  blue: "bg-muted text-foreground",
  rose: "bg-rose-50 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400",
  emerald: "bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400",
  violet: "bg-violet-50 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400",
  amber: "bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400",
} as const;

function Feature({
  icon,
  title,
  desc,
  color,
}: {
  icon: React.ReactNode;
  title: string;
  desc: string;
  color: keyof typeof colorMap;
}) {
  return (
    <div className="flex gap-4">
      <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${colorMap[color]}`}>{icon}</div>
      <div>
        <h3 className="text-sm font-semibold text-foreground">{title}</h3>
        <p className="text-sm text-muted-foreground mt-0.5">{desc}</p>
      </div>
    </div>
  );
}
