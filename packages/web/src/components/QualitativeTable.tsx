import { useState } from "react";
import ResultEditor from "./ResultEditor.tsx";
import type { Biomarker, I18n } from "../types.ts";

interface QualitativeTableProps {
  biomarkers: Biomarker[];
  i18n: I18n;
  profileId?: number;
  onMutate?: () => void;
}

export default function QualitativeTable({ biomarkers, i18n, profileId, onMutate }: QualitativeTableProps) {
  const [editingBiomarker, setEditingBiomarker] = useState<Biomarker | null>(null);
  const { t, tBio } = i18n;
  if (biomarkers.length === 0) return null;

  const dateSet = new Set<string>();
  biomarkers.forEach((b) => b.results.forEach((r) => dateSet.add(r.date)));
  const dates = [...dateSet].sort();

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 shadow-sm mb-6">
      <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3">{t("qualitativeResults")}</h3>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200 dark:border-gray-700">
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400">{t("test")}</th>
              {dates.map((d) => (
                <th key={d} className="px-3 py-2 text-xs font-medium text-gray-500 dark:text-gray-400 text-center">
                  {new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "2-digit" })}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {biomarkers.map((b) => (
              <tr key={b.id} className="border-t border-gray-100 dark:border-gray-700">
                <td className="px-3 py-2">
                  <div className="text-sm font-medium text-gray-900 dark:text-gray-100">{tBio(b.id, "name")}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">{b.id}</div>
                  {b.note && <div className="text-xs text-blue-600 dark:text-blue-400 mt-0.5">{b.note}</div>}
                  {profileId != null && onMutate && (
                    <button onClick={() => setEditingBiomarker(b)} className="text-xs text-blue-500 dark:text-blue-400 hover:underline mt-0.5">{t("editResultsLink")}</button>
                  )}
                </td>
                {dates.map((d) => {
                  const result = b.results.find((r) => r.date === d);
                  if (!result)
                    return (
                      <td key={d} className="px-3 py-2 text-center text-gray-300 dark:text-gray-600">
                        &mdash;
                      </td>
                    );
                  const isNeg = typeof result.value === "string" && result.value.toLowerCase() === "neg";
                  return (
                    <td
                      key={d}
                      className={`px-3 py-2 text-center text-sm ${isNeg ? "text-green-600 dark:text-green-400" : "text-gray-900 dark:text-gray-100"}`}
                    >
                      {result.value}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {editingBiomarker && profileId != null && onMutate && (
        <ResultEditor
          biomarker={editingBiomarker}
          profileId={profileId}
          i18n={i18n}
          onClose={() => setEditingBiomarker(null)}
          onMutate={() => { onMutate(); setEditingBiomarker(null); }}
        />
      )}
    </div>
  );
}
