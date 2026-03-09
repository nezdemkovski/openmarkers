import { useState, useCallback, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Sparkles, Copy, Check, FileText } from "lucide-react";
import { api } from "../lib/api.ts";
import { buildPrompt } from "@openmarkers/db/src/promptBuilder";
import { makeI18n } from "@openmarkers/db/src/i18n";
import type { UserData, I18n, Lang } from "../types.ts";

interface AiAnalysisProps {
  userData: UserData;
  lang: Lang;
  i18n: I18n;
  profileId?: number;
}

export default function AiAnalysis({ userData, lang, i18n, profileId }: AiAnalysisProps) {
  const { t } = i18n;
  const [copied, setCopied] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  const localPrompt = useMemo(
    () => (profileId == null ? buildPrompt(userData, makeI18n("en"), lang) : ""),
    [userData, lang, profileId],
  );

  const { data: promptData } = useQuery({
    queryKey: ["analysis-prompt", profileId, lang],
    queryFn: () => api.getAnalysisPrompt(profileId!, lang),
    enabled: profileId != null,
  });

  const prompt = promptData?.prompt ?? localPrompt;

  const handleCopy = useCallback(async () => {
    await navigator.clipboard.writeText(prompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [prompt]);

  return (
    <div className="mb-6">
      <div className="bg-linear-to-r from-violet-50 to-blue-50 dark:from-violet-950/30 dark:to-blue-950/30 border border-violet-200 dark:border-violet-700/50 rounded-xl p-4 shadow-sm">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-violet-100 dark:bg-violet-900/40 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-violet-600 dark:text-violet-400" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">{t("aiAnalysis")}</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {t("aiAnalysisDesc")
                  .split("{mcpLink}")
                  .map((part, i) =>
                    i === 0 ? (
                      part
                    ) : (
                      <span key={i}>
                        {profileId != null ? (
                          <a
                            href="/settings"
                            onClick={(e) => {
                              e.preventDefault();
                              history.pushState(null, "", "/settings");
                              window.dispatchEvent(new PopStateEvent("popstate"));
                              setTimeout(
                                () => document.getElementById("mcp")?.scrollIntoView({ behavior: "smooth" }),
                                100,
                              );
                            }}
                            className="text-violet-600 dark:text-violet-400 hover:underline"
                          >
                            {t("aiAnalysisSetupMcp")}
                          </a>
                        ) : (
                          t("aiAnalysisSetupMcp")
                        )}
                        {part}
                      </span>
                    ),
                  )}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowPreview((v) => !v)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              <FileText className="w-3.5 h-3.5" />
              {showPreview ? t("hidePrompt") : t("showPrompt")}
            </button>
            <button
              onClick={handleCopy}
              disabled={!prompt}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-violet-600 hover:bg-violet-700 text-white transition-colors disabled:opacity-50"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  {t("copied")}
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  {t("copyPrompt")}
                </>
              )}
            </button>
          </div>
        </div>

        {showPreview && prompt && (
          <div className="mt-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 max-h-96 overflow-y-auto">
            <pre className="text-xs text-gray-700 dark:text-gray-300 whitespace-pre-wrap font-mono leading-relaxed">
              {prompt}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}
