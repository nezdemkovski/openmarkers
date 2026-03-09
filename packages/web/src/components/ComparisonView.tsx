import { useState, useMemo } from "react";
import { ArrowUpRight, ArrowDownRight, Minus, TriangleAlert, CircleCheck } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { getAllDates, compareDates as compareDatesLocal } from "@openmarkers/db/src/analytics";
import type { Category, I18n, ComparisonRow } from "../types.ts";

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

interface ComparisonViewProps {
  categories: Category[];
  isDark: boolean;
  i18n: I18n;
}

export default function ComparisonView({ categories, isDark, i18n }: ComparisonViewProps) {
  const { t, tCat, tBio } = i18n;

  const dates = useMemo(() => getAllDates(categories), [categories]);

  const [date1, setDate1] = useState("");
  const [date2, setDate2] = useState("");

  const activeDate1 = date1 || (dates.length >= 2 ? dates[0] : dates[0] || "");
  const activeDate2 = date2 || (dates.length >= 2 ? dates[dates.length - 1] : "");

  const rows = useMemo(
    () => (activeDate1 && activeDate2 && activeDate1 !== activeDate2 ? compareDatesLocal(categories, activeDate1, activeDate2) : []),
    [categories, activeDate1, activeDate2],
  );

  const grouped = useMemo(() => {
    const map: Record<string, ComparisonRow[]> = {};
    for (const row of rows) {
      if (!map[row.categoryId]) map[row.categoryId] = [];
      map[row.categoryId].push(row);
    }
    return Object.entries(map);
  }, [rows]);

  const improved = rows.filter((r) => r.out1 && !r.out2).length;
  const worsened = rows.filter((r) => !r.out1 && r.out2).length;

  function fmtVal(v: number | string | null, unit?: string | null): string {
    if (v == null) return "\u2014";
    const s = typeof v === "number" ? (Number.isInteger(v) ? String(v) : (+v.toPrecision(4)).toString()) : String(v);
    return unit ? `${s} ${unit}` : s;
  }

  return (
    <>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{t("comparison")}</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{t("comparisonDesc")}</p>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 shadow-sm mb-6">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">{t("from")}</label>
            <select
              value={activeDate1}
              onChange={(e) => setDate1(e.target.value)}
              className="rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm px-3 py-1.5 text-gray-900 dark:text-gray-100"
            >
              {dates.map((d) => (
                <option key={d} value={d}>
                  {formatDate(d)}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">{t("to")}</label>
            <select
              value={activeDate2}
              onChange={(e) => setDate2(e.target.value)}
              className="rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm px-3 py-1.5 text-gray-900 dark:text-gray-100"
            >
              {dates.map((d) => (
                <option key={d} value={d}>
                  {formatDate(d)}
                </option>
              ))}
            </select>
          </div>
          {rows.length > 0 && (
            <div className="flex items-center gap-3 ml-auto text-xs">
              {improved > 0 && (
                <span className="badge-green">
                  {improved} {t("improved")}
                </span>
              )}
              {worsened > 0 && (
                <span className="badge-red">
                  {worsened} {t("worsened")}
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      {activeDate1 === activeDate2 && <div className="text-center text-sm text-gray-400 py-8">{t("selectDifferentDates")}</div>}

      {grouped.map(([catId, catRows]) => (
        <div
          key={catId}
          className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden mb-4"
        >
          <div className="px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
            <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              {tCat(catId, "name")}
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700 text-xs text-gray-500 dark:text-gray-400">
                  <th className="px-4 py-2 text-left font-medium">{t("test")}</th>
                  <th className="px-4 py-2 text-right font-medium">{formatDate(activeDate1)}</th>
                  <th className="px-4 py-2 text-right font-medium">{formatDate(activeDate2)}</th>
                  <th className="px-4 py-2 text-right font-medium">{t("change")}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                {catRows.map((row) => {
                  let deltaStr = "";
                  let deltaColor = "text-gray-400";
                  let DeltaIcon: LucideIcon = Minus;

                  if (row.delta != null) {
                    const abs = Math.abs(row.delta);
                    const pctAbs = row.deltaPct != null ? Math.abs(row.deltaPct) : null;
                    deltaStr = `${row.delta > 0 ? "+" : ""}${Number.isInteger(row.delta) ? row.delta : +row.delta.toPrecision(3)}`;
                    if (pctAbs != null && pctAbs >= 0.5) {
                      deltaStr += ` (${row.delta > 0 ? "+" : ""}${row.deltaPct!.toFixed(1)}%)`;
                    }

                    if (abs < 0.001) {
                      deltaColor = "text-gray-400";
                      DeltaIcon = Minus;
                    } else if (!row.out1 && row.out2) {
                      deltaColor = "text-red-600 dark:text-red-400";
                      DeltaIcon = row.delta > 0 ? ArrowUpRight : ArrowDownRight;
                    } else if (row.out1 && !row.out2) {
                      deltaColor = "text-green-600 dark:text-green-400";
                      DeltaIcon = row.delta > 0 ? ArrowUpRight : ArrowDownRight;
                    } else {
                      deltaColor = "text-gray-500 dark:text-gray-400";
                      DeltaIcon = row.delta > 0 ? ArrowUpRight : ArrowDownRight;
                    }
                  }

                  return (
                    <tr key={row.biomarkerId}>
                      <td className="px-4 py-2.5">
                        <div className="text-sm text-gray-900 dark:text-gray-100">{tBio(row.biomarkerId, "name")}</div>
                        <div className="text-xs text-gray-400 dark:text-gray-500">{row.biomarkerId}</div>
                      </td>
                      <td
                        className={`px-4 py-2.5 text-right text-sm font-mono ${row.out1 ? "text-red-700 dark:text-red-400 font-bold" : "text-gray-700 dark:text-gray-300"}`}
                      >
                        {fmtVal(row.v1, row.unit)}
                      </td>
                      <td
                        className={`px-4 py-2.5 text-right text-sm font-mono ${row.out2 ? "text-red-700 dark:text-red-400 font-bold" : "text-gray-700 dark:text-gray-300"}`}
                      >
                        {fmtVal(row.v2, row.unit)}
                      </td>
                      <td className={`px-4 py-2.5 text-right text-sm font-mono ${deltaColor}`}>
                        <span className="inline-flex items-center gap-1">
                          {deltaStr && <DeltaIcon className="w-3.5 h-3.5" />}
                          {deltaStr || "\u2014"}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ))}
    </>
  );
}
