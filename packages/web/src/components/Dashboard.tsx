import { useMemo, useState, useRef, useEffect } from "react";
import { TriangleAlert, CircleCheck, Clock, ChevronDown, Link2 } from "lucide-react";
import CategoryView from "./CategoryView.tsx";
import AiAnalysis from "./AiAnalysis.tsx";
import BioAgeCard from "./BioAgeCard.tsx";
import { daysSinceLastTest, getRelevantCorrelations } from "@openmarkers/db/src/analytics";
import { calculatePhenoAge } from "@openmarkers/db/src/bioage";
import type { Category, UserData, I18n, Lang, Biomarker, DaysSinceResult } from "../types.ts";

const PLACEHOLDER_STYLE = { minHeight: 200 };

function LazyCategory({ category, isDark, i18n, profileId, onMutate }: { category: Category; isDark: boolean; i18n: I18n; profileId?: number; onMutate?: () => void }) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const [prevCategory, setPrevCategory] = useState(category);

  if (category !== prevCategory) {
    setPrevCategory(category);
    setVisible(false);
  }

  useEffect(() => {
    if (visible) return;
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: "200px" },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [visible]);

  return (
    <div ref={ref}>
      {visible ? (
        <CategoryView category={category} isDark={isDark} i18n={i18n} profileId={profileId} onMutate={onMutate} />
      ) : (
        <div style={PLACEHOLDER_STYLE} />
      )}
    </div>
  );
}

function countOutOfRange(category: Category): number {
  let count = 0;
  for (const b of category.biomarkers) {
    if (b.results.length === 0) continue;
    const latest = b.results[b.results.length - 1];
    if (typeof latest.value === "number") {
      if ((b.refMin != null && latest.value < b.refMin) || (b.refMax != null && latest.value > b.refMax)) count++;
    }
  }
  return count;
}

function formatDaysAgo(days: number, t: I18n["t"]): string {
  if (days < 30) return `${days} ${t("daysAgo")}`;
  const months = Math.floor(days / 30);
  return `${months} ${t("monthsAgo")}`;
}

interface RemindersSectionProps {
  reminders: DaysSinceResult[];
  tCat: I18n["tCat"];
  t: I18n["t"];
  onNavigate: (target: string) => void;
}

function RemindersSection({ reminders, tCat, t, onNavigate }: RemindersSectionProps) {
  const [open, setOpen] = useState(false);
  return (
    <div className="mb-6">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center gap-2.5 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-700/50 rounded-lg px-4 py-3 hover:bg-amber-100 dark:hover:bg-amber-950/30 transition-colors"
      >
        <Clock className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
        <span className="text-sm font-medium text-amber-900 dark:text-amber-200 flex-1 text-left">
          {reminders.length} {t("overdueCategories")}
        </span>
        <ChevronDown className={`w-4 h-4 text-amber-500 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <div className="mt-2 space-y-1.5">
          {reminders.map((r) => (
            <div
              key={r.categoryId}
              className="flex items-center gap-3 bg-amber-50/50 dark:bg-amber-950/10 border border-amber-100 dark:border-amber-800/30 rounded-lg px-4 py-2.5 cursor-pointer hover:bg-amber-100 dark:hover:bg-amber-950/20 transition-colors"
              onClick={() => onNavigate(r.categoryId)}
            >
              <div className="flex-1 min-w-0">
                <span className="text-sm text-amber-900 dark:text-amber-200">{tCat(r.categoryId, "name")}</span>
                <span className="text-xs text-amber-600 dark:text-amber-400 ml-2">{formatDaysAgo(r.days!, t)}</span>
              </div>
              <span className="badge-red text-xs">{t("overdue")}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

interface DashboardProps {
  userData: UserData;
  categories: Category[];
  onNavigate: (target: string) => void;
  isDark: boolean;
  lang: Lang;
  i18n: I18n;
  profileId?: number;
  onMutate?: () => void;
}

export default function Dashboard({ userData, categories, onNavigate, isDark, lang, i18n, profileId, onMutate }: DashboardProps) {
  const { t, tCat, tBio } = i18n;

  const reminders = useMemo(() => {
    return daysSinceLastTest(categories).filter((r) => r.days != null && r.days > 180);
  }, [categories]);

  const bioAgeResults = useMemo(() => {
    if (!userData.user.dateOfBirth) return [];
    return calculatePhenoAge(categories, userData.user.dateOfBirth);
  }, [categories, userData.user.dateOfBirth]);

  const correlations = useMemo(() => {
    return getRelevantCorrelations(categories);
  }, [categories]);

  const bioLookup = useMemo(() => {
    const map: Record<string, Biomarker> = {};
    for (const cat of categories) {
      for (const bio of cat.biomarkers) map[bio.id] = bio;
    }
    return map;
  }, [categories]);

  return (
    <>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{t("allResults")}</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{t("allResultsDesc")}</p>
      </div>

      <AiAnalysis userData={userData} lang={lang} i18n={i18n} profileId={profileId} />

      <BioAgeCard results={bioAgeResults} isDark={isDark} i18n={i18n} />

      {reminders.length > 0 && <RemindersSection reminders={reminders} tCat={tCat} t={t} onNavigate={onNavigate} />}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-8">
        {categories.map((cat) => {
          const total = cat.biomarkers.length;
          const outCount = countOutOfRange(cat);
          const border =
            outCount > 0
              ? "border-red-300 dark:border-red-500/50 hover:border-red-400 dark:hover:border-red-400"
              : "border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600";
          const bg = outCount > 0 ? "bg-red-50/50 dark:bg-red-950/20" : "bg-white dark:bg-gray-800";

          return (
            <div
              key={cat.id}
              className={`${bg} rounded-xl border ${border} p-4 shadow-sm cursor-pointer transition-colors`}
              onClick={() => onNavigate(cat.id)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {outCount > 0 ? (
                    <TriangleAlert className="w-4 h-4 text-red-500 dark:text-red-400" />
                  ) : (
                    <CircleCheck className="w-4 h-4 text-green-500 dark:text-green-400" />
                  )}
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">{tCat(cat.id, "name")}</h3>
                </div>
                {outCount > 0 ? (
                  <span className="badge-red">
                    {outCount} {t("flagged")}
                  </span>
                ) : (
                  <span className="badge-green">{t("allOk")}</span>
                )}
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {total} {total !== 1 ? t("biomarkers") : t("biomarker")}
              </p>
            </div>
          );
        })}
      </div>

      {correlations.length > 0 && (
        <div className="mb-8">
          <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-3 flex items-center gap-2">
            <Link2 className="w-5 h-5" />
            {t("correlations")}
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">{t("correlationsDesc")}</p>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {correlations.map((group) => {
              const bios = group.matched.map((id) => bioLookup[id]).filter(Boolean);
              const outCount = bios.filter((b) => {
                const latest = b.results[b.results.length - 1];
                return (
                  latest &&
                  typeof latest.value === "number" &&
                  ((b.refMin != null && latest.value < b.refMin) || (b.refMax != null && latest.value > b.refMax))
                );
              }).length;

              return (
                <div
                  key={group.id}
                  className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 shadow-sm"
                >
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100">{t(group.id)}</h4>
                    {outCount > 0 ? (
                      <span className="badge-red">
                        {outCount} {t("flagged")}
                      </span>
                    ) : (
                      <span className="badge-green">{t("allOk")}</span>
                    )}
                  </div>
                  <div className="space-y-1.5">
                    {bios.map((bio) => {
                      const latest = bio.results[bio.results.length - 1];
                      const val = latest?.value;
                      const out =
                        typeof val === "number" &&
                        ((bio.refMin != null && val < bio.refMin) || (bio.refMax != null && val > bio.refMax));
                      const formatted =
                        typeof val === "number"
                          ? Number.isInteger(val)
                            ? val
                            : +val.toPrecision(4)
                          : (val ?? "\u2014");

                      return (
                        <div key={bio.id} className="flex items-center justify-between text-sm">
                          <span
                            className={`${out ? "text-red-700 dark:text-red-400" : "text-gray-700 dark:text-gray-300"}`}
                          >
                            {tBio(bio.id, "name")}
                          </span>
                          <span
                            className={`font-mono text-xs ${out ? "font-bold text-red-700 dark:text-red-400" : "text-gray-500 dark:text-gray-400"}`}
                          >
                            {formatted}
                            {bio.unit ? ` ${bio.unit}` : ""}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {categories.map((cat) => (
        <LazyCategory key={cat.id} category={cat} isDark={isDark} i18n={i18n} profileId={profileId} onMutate={onMutate} />
      ))}
    </>
  );
}
