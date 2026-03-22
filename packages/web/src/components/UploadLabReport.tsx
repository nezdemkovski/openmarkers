import {
  Upload,
  Loader2,
  Trash2,
  CheckCircle,
  AlertCircle,
  X,
} from "lucide-react";
import { useState, useRef, useCallback } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import { api } from "../lib/api";
import { errorMessage } from "../lib/utils";
import type { I18n } from "../types";

type Phase = "idle" | "extracting" | "reviewing" | "importing" | "done" | "error";

const MAX_FILE_SIZE = 20 * 1024 * 1024;

interface ExtractedResult {
  biomarkerId: string;
  biomarkerName: string;
  categoryId: string;
  date: string;
  value: number | string;
  unit?: string;
}

interface ExtractedData {
  user: { name: string; dateOfBirth?: string; sex?: string };
  categories: {
    id: string;
    biomarkers: {
      id: string;
      results: { date: string; value: number | string }[];
    }[];
  }[];
}

interface UploadLabReportProps {
  i18n: I18n;
  profileId: number;
  onImported: () => void;
  onActiveChange?: (active: boolean) => void;
}

export default function UploadLabReport({
  i18n,
  profileId,
  onImported,
  onActiveChange,
}: UploadLabReportProps) {
  const { t, tBio } = i18n;
  const fileRef = useRef<HTMLInputElement>(null);
  const [phase, setPhase] = useState<Phase>("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const [results, setResults] = useState<ExtractedResult[]>([]);
  const [unknownMarkers, setUnknownMarkers] = useState<
    Array<{ id: string; value: number | string }>
  >([]);

  const processFile = useCallback(
    async (file: File) => {
      if (file.size > MAX_FILE_SIZE) {
        setPhase("error");
        setErrorMsg(t("uploadTooLarge"));
        return;
      }

      setPhase("extracting");
      setErrorMsg("");
      onActiveChange?.(true);

      try {
        const base64 = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });

        const response = await api.extractLabReport({
          file: base64,
          fileName: file.name,
        });

        const data = response.data as ExtractedData;
        const units = response.units || {};
        setUnknownMarkers(response.unknown || []);

        const flat: ExtractedResult[] = [];
        for (const cat of data.categories) {
          for (const bio of cat.biomarkers) {
            for (const r of bio.results) {
              flat.push({
                biomarkerId: bio.id,
                biomarkerName: tBio(bio.id, "name") || bio.id,
                categoryId: cat.id,
                date: r.date,
                value: r.value,
                unit: units[bio.id],
              });
            }
          }
        }

        if (flat.length === 0) {
          setPhase("error");
          setErrorMsg(t("uploadError"));
          onActiveChange?.(false);
          return;
        }

        setResults(flat);
        setPhase("reviewing");
      } catch (err: unknown) {
        setPhase("error");
        onActiveChange?.(false);
        const msg = errorMessage(err);
        if (msg.includes("429")) setErrorMsg(t("uploadLimitReached"));
        else if (msg.includes("413") || msg.includes("Too Large"))
          setErrorMsg(t("uploadTooLarge"));
        else setErrorMsg(t("uploadError"));
      }
    },
    [t, tBio],
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      const file = e.dataTransfer.files[0];
      if (file) processFile(file);
    },
    [processFile],
  );

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) processFile(file);
    },
    [processFile],
  );

  const removeResult = (index: number) => {
    setResults((prev) => prev.filter((_, i) => i !== index));
  };

  const updateValue = (index: number, value: string) => {
    setResults((prev) =>
      prev.map((r, i) =>
        i === index
          ? { ...r, value: value === "" ? "" : isNaN(Number(value)) ? value : Number(value) }
          : r,
      ),
    );
  };

  const handleConfirm = async () => {
    if (results.length === 0) return;
    setPhase("importing");
    setErrorMsg("");

    try {
      const byDate = new Map<
        string,
        Array<{
          biomarker_id: string;
          category_id: string;
          value: string | number;
        }>
      >();
      for (const r of results) {
        if (!byDate.has(r.date)) byDate.set(r.date, []);
        byDate.get(r.date)!.push({
          biomarker_id: r.biomarkerId,
          category_id: r.categoryId,
          value: r.value,
        });
      }

      await Promise.all(
        Array.from(byDate, ([date, entries]) =>
          api.batchResults({ profile_id: profileId, date, entries }),
        ),
      );

      setPhase("done");
      onImported();
    } catch (err: unknown) {
      setPhase("error");
      onActiveChange?.(false);
      setErrorMsg(errorMessage(err));
    }
  };

  const reset = () => {
    setPhase("idle");
    setResults([]);
    setUnknownMarkers([]);
    setErrorMsg("");
    onActiveChange?.(false);
    if (fileRef.current) fileRef.current.value = "";
  };

  if (phase === "idle" || phase === "error") {
    return (
      <div className="space-y-3">
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          className={`w-full rounded-xl border-2 border-dashed p-8 text-center transition-colors ${
            dragOver
              ? "border-primary bg-primary/5"
              : "border-border/60 hover:border-border hover:bg-muted/30"
          }`}
        >
          <Upload className="w-8 h-8 text-muted-foreground/40 mx-auto mb-3" />
          <p className="text-sm font-medium text-foreground">
            {t("uploadDrop")}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            {t("uploadFormats")}
          </p>
        </button>
        <input
          ref={fileRef}
          type="file"
          accept=".pdf,.jpg,.jpeg,.png"
          onChange={handleFileChange}
          className="hidden"
        />
        {phase === "error" && errorMsg && (
          <div className="flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/5 p-3">
            <AlertCircle className="w-4 h-4 text-destructive shrink-0 mt-0.5" />
            <p className="text-xs text-destructive">{errorMsg}</p>
          </div>
        )}
      </div>
    );
  }

  if (phase === "extracting" || phase === "importing") {
    return (
      <div className="flex flex-col items-center justify-center py-12 gap-3">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
        <p className="text-sm text-muted-foreground">
          {phase === "extracting" ? t("uploadReading") : t("uploadImporting")}
        </p>
        <p className="text-[11px] text-muted-foreground/50">
          {t("uploadDontClose")}
        </p>
        {phase === "extracting" && (
          <button
            onClick={reset}
            className="mt-2 text-xs text-muted-foreground/50 hover:text-muted-foreground transition-colors"
          >
            {t("uploadCancel")}
          </button>
        )}
      </div>
    );
  }

  if (phase === "done") {
    return (
      <div className="flex flex-col items-center justify-center py-12 gap-3">
        <CheckCircle className="w-8 h-8 text-green-500" />
        <p className="text-sm font-medium text-foreground">
          {t("uploadSuccess")}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-sm font-semibold text-foreground">
          {t("uploadReview")}
        </h3>
        <p className="text-xs text-muted-foreground mt-0.5">
          {t("uploadReviewDesc")}
        </p>
        <p className="text-[11px] text-amber-600/80 dark:text-amber-400/60 mt-1.5">
          {t("uploadAiDisclaimer")}
        </p>
      </div>

      <div className="rounded-lg border border-border overflow-hidden">
        <div className="max-h-[360px] overflow-y-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted sticky top-0 z-10">
              <tr>
                <th className="text-left text-xs font-medium text-muted-foreground px-3 py-2">
                  {t("uploadColBiomarker")}
                </th>
                <th className="text-left text-xs font-medium text-muted-foreground px-3 py-2 w-28">
                  {t("uploadColValue")}
                </th>
                <th className="text-left text-xs font-medium text-muted-foreground px-3 py-2 w-24">
                  {t("uploadColDate")}
                </th>
                <th className="w-8" />
              </tr>
            </thead>
            <tbody>
              {results.map((r, i) => (
                <tr
                  key={`${r.biomarkerId}-${i}`}
                  className="border-t border-border/50"
                >
                  <td className="px-3 py-1.5">
                    <div>
                      <span className="text-xs font-medium text-foreground">
                        {r.biomarkerName}
                      </span>
                      <span className="text-[10px] text-muted-foreground/50 ml-1.5">
                        {r.biomarkerId}
                      </span>
                    </div>
                  </td>
                  <td className="px-3 py-1.5">
                    <div className="flex items-center gap-1.5">
                      <Input
                        type="text"
                        value={String(r.value)}
                        onChange={(e) => updateValue(i, e.target.value)}
                        className="h-7 text-xs px-2 w-20"
                      />
                      {r.unit && (
                        <span className="text-[11px] text-muted-foreground/60 shrink-0">
                          {r.unit}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-3 py-1.5 text-xs text-muted-foreground">
                    {r.date}
                  </td>
                  <td className="px-1 py-1.5">
                    <button
                      onClick={() => removeResult(i)}
                      className="p-1 text-muted-foreground/40 hover:text-destructive transition-colors"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {unknownMarkers.length > 0 && (
        <div className="rounded-lg border border-amber-200/60 dark:border-amber-800/30 bg-amber-50/50 dark:bg-amber-950/20 p-3">
          <p className="text-xs font-medium text-amber-700 dark:text-amber-400 mb-1.5">
            {t("uploadUnknownTitle")} ({unknownMarkers.length})
          </p>
          <div className="flex flex-wrap gap-1.5 mb-2">
            {unknownMarkers.map((u) => (
              <span
                key={u.id}
                className="text-[11px] text-amber-600/80 dark:text-amber-400/60 bg-amber-100/60 dark:bg-amber-900/30 px-1.5 py-0.5 rounded"
              >
                {u.id}: {String(u.value)}
              </span>
            ))}
          </div>
          <a
            href={`https://github.com/nezdemkovski/openmarkers/issues/new?title=${encodeURIComponent("Missing biomarkers: " + unknownMarkers.map((u) => u.id).join(", "))}&body=${encodeURIComponent("These biomarkers were found in my lab report but not supported yet:\n\n" + unknownMarkers.map((u) => `- ${u.id}: ${u.value}`).join("\n"))}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[11px] text-amber-600 dark:text-amber-400 underline underline-offset-2 hover:text-amber-700 dark:hover:text-amber-300"
          >
            {t("uploadUnknownReport")}
          </a>
        </div>
      )}

      <div className="flex items-center justify-between gap-3">
        <Button
          variant="outline"
          onClick={reset}
          className="rounded-full text-xs h-8 px-4 gap-1"
        >
          <X className="w-3 h-3" />
          {t("uploadCancel")}
        </Button>
        <Button
          onClick={handleConfirm}
          disabled={results.length === 0}
          className="rounded-full text-xs h-8 px-5"
        >
          {t("uploadConfirm")} ({results.length})
        </Button>
      </div>
    </div>
  );
}
