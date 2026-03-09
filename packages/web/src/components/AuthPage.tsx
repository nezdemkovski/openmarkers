import { useState } from "react";
import { authClient } from "../lib/auth-client";
import { LineChart, HeartPulse, FlaskConical, Bot, ShieldCheck, Github, Play, Languages, Sun, Moon } from "lucide-react";
import { LANGS } from "../i18n";
import { isLang, errorMessage } from "../lib/utils";
import type { I18n } from "../types";

interface AuthPageProps {
  onAuthenticated: () => void;
  onDemo: () => void;
  i18n: I18n;
  lang: Lang;
  onChangeLang: (lang: Lang) => void;
  isDark: boolean;
  onToggleTheme: () => void;
}

export default function AuthPage({ onAuthenticated, onDemo, i18n, lang, onChangeLang, isDark, onToggleTheme }: AuthPageProps) {
  const { t } = i18n;
  const [tab, setTab] = useState<"login" | "signup">("signup");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
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
          name: name || email.split("@")[0],
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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Language selector */}
      <div className="absolute top-4 right-4 flex items-center gap-3 text-gray-400 dark:text-gray-500">
        <button
          onClick={onToggleTheme}
          className="p-1.5 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors text-gray-500 dark:text-gray-400"
        >
          {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>
        <div className="flex items-center gap-1.5">
          <Languages className="w-4 h-4" />
          <select
            value={lang}
            onChange={(e) => { const v = e.target.value; if (isLang(v)) onChangeLang(v); }}
            className="text-xs bg-transparent border-none focus:outline-none cursor-pointer text-gray-500 dark:text-gray-400"
          >
            {LANGS.map((l) => (
              <option key={l.code} value={l.code}>{l.nativeName}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-12 md:py-20">
        {/* Hero */}
        <div className="text-center mb-10 md:mb-14">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-gray-100 tracking-tight">
            OpenMarkers
          </h1>
          <p className="mt-3 text-lg md:text-xl text-gray-500 dark:text-gray-400 max-w-xl mx-auto">
            {t("heroSubtitle")}
          </p>
          <div className="mt-4 flex items-center justify-center gap-4 text-xs text-gray-400 dark:text-gray-500">
            <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />{t("heroBadgeOpenSource")}</span>
            <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-blue-500" />{t("heroBadgeBiomarkers")}</span>
            <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-violet-500" />{t("heroBadgeMcp")}</span>
          </div>
        </div>

        {/* Demo CTA — most prominent action */}
        <div className="max-w-md mx-auto mb-10 md:mb-14">
          <button
            onClick={onDemo}
            className="w-full py-3 px-5 rounded-xl bg-violet-600 dark:bg-violet-600 text-white font-medium hover:bg-violet-700 dark:hover:bg-violet-500 transition-colors flex items-center justify-center gap-2 shadow-sm"
          >
            <Play className="w-4 h-4" />
            {t("heroDemoButton")}
          </button>
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
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 space-y-4">
              <div className="flex rounded-lg bg-gray-100 dark:bg-gray-700 p-0.5">
                <button
                  onClick={() => { setTab("signup"); setError(""); }}
                  className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${
                    tab === "signup"
                      ? "bg-white dark:bg-gray-600 text-gray-900 dark:text-gray-100 shadow-sm"
                      : "text-gray-500 dark:text-gray-400"
                  }`}
                >
                  {t("authSignUp") || "Sign Up"}
                </button>
                <button
                  onClick={() => { setTab("login"); setError(""); }}
                  className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${
                    tab === "login"
                      ? "bg-white dark:bg-gray-600 text-gray-900 dark:text-gray-100 shadow-sm"
                      : "text-gray-500 dark:text-gray-400"
                  }`}
                >
                  {t("authLogin") || "Log In"}
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-3">
                {tab === "signup" && (
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder={t("authName") || "Name"}
                    autoComplete="name"
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                )}
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={t("authEmail") || "Email"}
                  required
                  autoComplete="email"
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={t("authPassword") || "Password"}
                  required
                  minLength={8}
                  autoComplete={tab === "signup" ? "new-password" : "current-password"}
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />

                {tab === "signup" && (
                  <label className="flex items-start gap-2 text-xs text-gray-600 dark:text-gray-400">
                    <input
                      type="checkbox"
                      checked={consent}
                      onChange={(e) => setConsent(e.target.checked)}
                      className="mt-0.5 rounded border-gray-300 dark:border-gray-600"
                    />
                    <span>{t("authConsent") || "I agree to store my blood test results and lab data"}</span>
                  </label>
                )}

                {error && (
                  <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
                )}

                <button
                  type="submit"
                  disabled={loading || (tab === "signup" && !consent)}
                  className="w-full py-2.5 px-4 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors"
                >
                  {loading
                    ? "..."
                    : tab === "login"
                      ? t("authLogin") || "Log In"
                      : t("authSignUp") || "Sign Up"}
                </button>
              </form>
            </div>

            <div className="text-center text-xs text-gray-400 dark:text-gray-500 space-y-1">
              <p>{t("authDisclaimer") || "This is not a medical device or healthcare service. Not medical advice."}</p>
              <p>
                <a href="/privacy" className="hover:underline">Privacy Policy</a>
                {" · "}
                <a href="/terms" className="hover:underline">Terms of Service</a>
                {" · "}
                <a href="https://github.com/nezdemkovski/openmarkers" target="_blank" rel="noopener noreferrer" className="hover:underline inline-flex items-center gap-1">
                  <Github className="w-3 h-3" />
                  GitHub
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const colorMap = {
  blue: "bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400",
  rose: "bg-rose-50 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400",
  emerald: "bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400",
  violet: "bg-violet-50 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400",
  amber: "bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400",
} as const;

function Feature({ icon, title, desc, color }: { icon: React.ReactNode; title: string; desc: string; color: keyof typeof colorMap }) {
  return (
    <div className="flex gap-4">
      <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${colorMap[color]}`}>
        {icon}
      </div>
      <div>
        <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">{title}</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{desc}</p>
      </div>
    </div>
  );
}
