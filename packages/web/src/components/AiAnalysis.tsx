import { makeI18n } from "@openmarkers/db/src/i18n";
import { buildPrompt } from "@openmarkers/db/src/promptBuilder";
import { useQuery } from "@tanstack/react-query";
import { Sparkles, Copy, Check, FileText } from "lucide-react";
import { useState, useCallback, useMemo } from "react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Collapsible,
  CollapsibleTrigger,
  CollapsibleContent,
} from "@/components/ui/collapsible";

import { track, Event } from "../lib/analytics.ts";
import { api } from "../lib/api.ts";
import type { UserData, I18n, Lang } from "../types.ts";

interface AiAnalysisProps {
  userData: UserData;
  lang: Lang;
  i18n: I18n;
  profileId?: number;
}

export default function AiAnalysis({
  userData,
  lang,
  i18n,
  profileId,
}: AiAnalysisProps) {
  const { t } = i18n;
  const [copied, setCopied] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  const localPrompt = useMemo(
    () =>
      profileId == null ? buildPrompt(userData, makeI18n("en"), lang) : "",
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
    track(Event.AiPromptCopied);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [prompt]);

  return (
    <div className="mb-6">
      <Card className="bg-linear-to-r from-violet-50 to-violet-50/50 dark:from-violet-950/30 dark:to-violet-950/15 border-violet-200 dark:border-violet-700/50 p-4">
        <Collapsible open={showPreview} onOpenChange={setShowPreview}>
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-lg bg-violet-100 dark:bg-violet-900/40 flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-violet-600 dark:text-violet-400" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-foreground">
                  {t("aiAnalysis")}
                </h3>
                <p className="text-xs text-muted-foreground">
                  {t("aiAnalysisDesc")
                    .split(/(\{mcpLink\}|\{cliLink\})/)
                    .map((part, i) => {
                      if (part === "{mcpLink}" || part === "{cliLink}") {
                        const isMcp = part === "{mcpLink}";
                        const label = t(
                          isMcp ? "aiAnalysisSetupMcp" : "aiAnalysisSetupCli",
                        );
                        const targetId = isMcp ? "mcp" : "cli";
                        return profileId != null ? (
                          <a
                            key={i}
                            href="/dashboard/settings"
                            onClick={(e) => {
                              e.preventDefault();
                              history.pushState(
                                null,
                                "",
                                "/dashboard/settings",
                              );
                              window.dispatchEvent(
                                new PopStateEvent("popstate"),
                              );
                              setTimeout(
                                () =>
                                  document
                                    .getElementById(targetId)
                                    ?.scrollIntoView({ behavior: "smooth" }),
                                100,
                              );
                            }}
                            className="text-violet-600 dark:text-violet-400 hover:underline"
                          >
                            {label}
                          </a>
                        ) : (
                          <span key={i}>{label}</span>
                        );
                      }
                      return part;
                    })}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <CollapsibleTrigger
                render={
                  <Button variant="outline" size="sm">
                    <FileText className="w-3.5 h-3.5" />
                    {showPreview ? t("hidePrompt") : t("showPrompt")}
                  </Button>
                }
              />
              <Button
                size="sm"
                onClick={handleCopy}
                disabled={!prompt}
                className="bg-violet-600 hover:bg-violet-700 text-white"
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
              </Button>
            </div>
          </div>

          <CollapsibleContent>
            {prompt && (
              <Card className="mt-4 p-4 max-h-96 overflow-y-auto overflow-x-hidden">
                <pre className="text-xs text-muted-foreground whitespace-pre-wrap break-words font-mono leading-relaxed">
                  {prompt}
                </pre>
              </Card>
            )}
          </CollapsibleContent>
        </Collapsible>
      </Card>
    </div>
  );
}
