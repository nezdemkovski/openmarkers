import { useState, useMemo } from "react";
import { Calendar, TriangleAlert, CircleCheck } from "lucide-react";
import { getAllDates, getDateSnapshot } from "@openmarkers/db/src/analytics";
import type { Category, I18n, SnapshotItem } from "../types.ts";

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function formatShort(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "2-digit",
  });
}

interface TimelineViewProps {
  categories: Category[];
  isDark: boolean;
  i18n: I18n;
}

export default function TimelineView({ categories, isDark, i18n }: TimelineViewProps) {
  const { t, tCat, tBio } = i18n;

  const dates = useMemo(() => getAllDates(categories), [categories]);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const activeDate = selectedDate ?? dates[dates.length - 1] ?? null;

  const snapshot = useMemo(
    () => (activeDate ? getDateSnapshot(categories, activeDate) : []),
    [categories, activeDate],
  );

  const grouped = useMemo(() => {
    const map: Record<string, SnapshotItem[]> = {};
    for (const item of snapshot) {
      if (!map[item.categoryId]) map[item.categoryId] = [];
      map[item.categoryId].push(item);
    }
    return Object.entries(map);
  }, [snapshot]);

  const outCount = snapshot.filter((s) => s.outOfRange).length;

  return (
    <>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{t("timeline")}</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{t("timelineDesc")}</p>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 shadow-sm mb-6">
        <div className="flex items-center gap-2 overflow-x-auto pb-2">
          {dates.map((d) => {
            const active = d === activeDate;
            return (
              <button
                key={d}
                onClick={() => setSelectedDate(d)}
                className={`shrink-0 flex flex-col items-center gap-1 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                  active
                    ? "bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 ring-2 ring-blue-400 dark:ring-blue-500"
                    : "bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600"
                }`}
              >
                <Calendar className="w-3.5 h-3.5" />
                <span>{formatShort(d)}</span>
              </button>
            );
          })}
        </div>
      </div>

      {activeDate && (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
              {t("snapshot")} {"\u2014"} {formatDate(activeDate)}
            </h3>
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {snapshot.length} {t("biomarkers")}
              </span>
              {outCount > 0 && (
                <span className="badge-red">
                  {outCount} {t("flagged")}
                </span>
              )}
              {outCount === 0 && snapshot.length > 0 && <span className="badge-green">{t("allOk")}</span>}
            </div>
          </div>

          {grouped.map(([catId, items]) => (
            <div key={catId}>
              <div className="px-4 py-2 bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {tCat(catId, "name")}
                </span>
              </div>
              <div className="divide-y divide-gray-100 dark:divide-gray-700">
                {items.map((item) => {
                  const refParts: (number | null | undefined)[] = [];
                  if (item.refMin != null) refParts.push(item.refMin);
                  if (item.refMax != null) refParts.push(item.refMax);
                  const formatted =
                    typeof item.value === "number"
                      ? Number.isInteger(item.value)
                        ? item.value
                        : +item.value.toPrecision(4)
                      : item.value;

                  return (
                    <div key={item.biomarkerId} className="px-4 py-2.5 flex items-center justify-between">
                      <div className="flex items-center gap-2 min-w-0">
                        {item.outOfRange ? (
                          <TriangleAlert className="w-3.5 h-3.5 text-red-500 dark:text-red-400 shrink-0" />
                        ) : (
                          <CircleCheck className="w-3.5 h-3.5 text-green-500 dark:text-green-400 shrink-0" />
                        )}
                        <div className="min-w-0">
                          <span className="text-sm text-gray-900 dark:text-gray-100">
                            {tBio(item.biomarkerId, "name")}
                          </span>
                          {refParts.length > 0 && (
                            <span className="text-xs text-gray-400 dark:text-gray-500 ml-2">
                              ({t("ref")}: {refParts.join(" \u2013 ")})
                            </span>
                          )}
                        </div>
                      </div>
                      <span
                        className={`text-sm font-mono shrink-0 ml-3 ${
                          item.outOfRange
                            ? "font-bold text-red-700 dark:text-red-400"
                            : "text-gray-700 dark:text-gray-300"
                        }`}
                      >
                        {formatted}
                        {item.unit ? ` ${item.unit}` : ""}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}

          {snapshot.length === 0 && (
            <div className="px-4 py-8 text-center text-sm text-gray-400">{t("noDataForDate")}</div>
          )}
        </div>
      )}
    </>
  );
}
