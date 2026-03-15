import {
  TriangleAlert,
  CircleCheck,
  Clock,
  ChevronDown,
  Link2,
  ChevronRight,
} from "lucide-react";
import { useMemo, useRef, useState, useEffect } from "react";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

import type { Category, UserData, I18n, Lang, Biomarker } from "../types.ts";
import AiAnalysis from "./AiAnalysis.tsx";
import BioAgeCard from "./BioAgeCard.tsx";
import CategoryView from "./CategoryView.tsx";

function CategorySkeleton({ count }: { count: number }) {
  return (
    <div className="space-y-4 mb-8">
      <div className="space-y-1">
        <Skeleton className="h-6 w-48" />
        <Skeleton className="h-4 w-64" />
      </div>
      {Array.from({ length: Math.min(count, 3) }, (_, i) => (
        <div key={i} className="rounded-xl border border-border p-4 space-y-3">
          <div className="flex items-start justify-between">
            <div className="space-y-1.5">
              <Skeleton className="h-4 w-40" />
              <Skeleton className="h-3 w-28" />
            </div>
            <Skeleton className="h-5 w-20 rounded-full" />
          </div>
          <Skeleton className="h-3 w-full max-w-sm" />
          <Skeleton className="h-48 w-full rounded-lg" />
        </div>
      ))}
    </div>
  );
}

function LazyCategory({
  category,
  isDark,
  i18n,
  profileId,
  onMutate,
}: {
  category: Category;
  isDark: boolean;
  i18n: I18n;
  profileId?: number;
  onMutate?: () => void;
}) {
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
        <CategoryView
          category={category}
          isDark={isDark}
          i18n={i18n}
          profileId={profileId}
          onMutate={onMutate}
        />
      ) : (
        <CategorySkeleton count={category.biomarkers.length} />
      )}
    </div>
  );
}

function countOutOfRange(category: Category): number {
  let count = 0;
  for (const b of category.biomarkers) {
    if (b.latestOutOfRange) count++;
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

function RemindersSection({
  reminders,
  tCat,
  t,
  onNavigate,
}: RemindersSectionProps) {
  const [open, setOpen] = useState(false);
  const sorted = useMemo(
    () => [...reminders].sort((a, b) => (b.days ?? 0) - (a.days ?? 0)),
    [reminders],
  );

  return (
    <div className="mb-6 rounded-xl bg-card text-card-foreground ring-1 ring-foreground/10 overflow-hidden">
      <button
        type="button"
        className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-muted/50 transition-colors"
        onClick={() => setOpen(!open)}
      >
        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-amber-100 dark:bg-amber-900/40 shrink-0">
          <Clock className="w-4 h-4 text-amber-600 dark:text-amber-400" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-foreground">
            {reminders.length} {t("overdueCategories")}
          </p>
          <p className="text-xs text-muted-foreground">{t("overdueDesc")}</p>
        </div>
        <ChevronDown
          className={`w-4 h-4 text-muted-foreground transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <div className="border-t border-border divide-y divide-border">
          {sorted.map((r) => {
            const days = r.days!;
            const months = Math.floor(days / 30);
            const severity =
              days > 365 ? "high" : days > 270 ? "medium" : "low";

            return (
              <button
                type="button"
                key={r.categoryId}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-left hover:bg-muted/50 transition-colors group"
                onClick={() => onNavigate(r.categoryId)}
              >
                <div
                  className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                    severity === "high"
                      ? "bg-destructive"
                      : severity === "medium"
                        ? "bg-amber-500"
                        : "bg-amber-400 dark:bg-amber-600"
                  }`}
                />
                <span className="flex-1 text-sm text-foreground break-words min-w-0">
                  {tCat(r.categoryId, "name")}
                </span>
                <span
                  className={`text-xs tabular-nums ${
                    severity === "high"
                      ? "text-destructive font-medium"
                      : "text-muted-foreground"
                  }`}
                >
                  {months > 0
                    ? `${months} ${t("monthsAgo")}`
                    : `${days} ${t("daysAgo")}`}
                </span>
                <ChevronRight className="w-3.5 h-3.5 text-muted-foreground/50 group-hover:text-muted-foreground transition-colors" />
              </button>
            );
          })}
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

export default function Dashboard({
  userData,
  categories,
  onNavigate,
  isDark,
  lang,
  i18n,
  profileId,
  onMutate,
}: DashboardProps) {
  const { t, tCat, tBio } = i18n;

  const reminders = useMemo(
    () =>
      (userData.daysSince ?? []).filter((d) => d.days != null && d.days > 180),
    [userData.daysSince],
  );
  const correlations = userData.correlations ?? [];
  const bioAgeResults = userData.biologicalAge?.results ?? [];
  const missingBioAgeMarkers = userData.biologicalAge?.missingMarkers ?? [];

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
        <h2 className="text-2xl font-bold text-foreground">
          {t("allResults")}
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          {t("allResultsDesc")}
        </p>
      </div>

      <AiAnalysis
        userData={userData}
        lang={lang}
        i18n={i18n}
        profileId={profileId}
      />

      <BioAgeCard
        results={bioAgeResults}
        isDark={isDark}
        i18n={i18n}
        missingMarkers={missingBioAgeMarkers}
      />

      {reminders.length > 0 && (
        <RemindersSection
          reminders={reminders}
          tCat={tCat}
          t={t}
          onNavigate={onNavigate}
        />
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-8">
        {categories.map((cat) => {
          const total = cat.biomarkers.length;
          const outCount = countOutOfRange(cat);
          const border =
            outCount > 0
              ? "border-destructive/40 hover:border-destructive/60"
              : "border-border hover:border-ring";
          const bg = outCount > 0 ? "bg-destructive/5" : "bg-card";

          return (
            <div
              key={cat.id}
              className={`${bg} rounded-xl border ${border} p-4 shadow-sm cursor-pointer transition-colors`}
              onClick={() => onNavigate(cat.id)}
            >
              <div className="flex items-start gap-2">
                <div className="shrink-0 mt-0.5">
                  {outCount > 0 ? (
                    <TriangleAlert className="w-4 h-4 text-destructive" />
                  ) : (
                    <CircleCheck className="w-4 h-4 text-green-500 dark:text-green-400" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="text-sm font-semibold text-foreground break-words min-w-0">
                      {tCat(cat.id, "name")}
                    </h3>
                    <div className="shrink-0">
                      {outCount > 0 ? (
                        <Badge variant="destructive">
                          {outCount} {t("flagged")}
                        </Badge>
                      ) : (
                        <Badge variant="success">{t("allOk")}</Badge>
                      )}
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {total} {total !== 1 ? t("biomarkers") : t("biomarker")}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {correlations.length > 0 && (
        <div className="mb-8">
          <h3 className="text-lg font-bold text-foreground mb-3 flex items-center gap-2">
            <Link2 className="w-5 h-5" />
            {t("correlations")}
          </h3>
          <p className="text-sm text-muted-foreground mb-4">
            {t("correlationsDesc")}
          </p>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {correlations.map((group) => {
              const bios = group.matched
                .map((id) => bioLookup[id])
                .filter(Boolean);
              const outCount = bios.filter((b) => b.latestOutOfRange).length;

              return (
                <Card key={group.id} className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-sm font-semibold text-foreground">
                      {t(group.id)}
                    </h4>
                    {outCount > 0 ? (
                      <Badge variant="destructive">
                        {outCount} {t("flagged")}
                      </Badge>
                    ) : (
                      <Badge variant="success">{t("allOk")}</Badge>
                    )}
                  </div>
                  <div className="space-y-1.5">
                    {bios.map((bio) => {
                      const latest = bio.results[bio.results.length - 1];
                      const val = latest?.value;
                      const out =
                        typeof val === "number" &&
                        ((bio.refMin != null && val < bio.refMin) ||
                          (bio.refMax != null && val > bio.refMax));
                      const formatted =
                        typeof val === "number"
                          ? Number.isInteger(val)
                            ? val
                            : +val.toPrecision(4)
                          : (val ?? "\u2014");

                      return (
                        <div
                          key={bio.id}
                          className="flex items-center justify-between text-sm"
                        >
                          <span
                            className={`${out ? "text-destructive" : "text-foreground"}`}
                          >
                            {tBio(bio.id, "name")}
                          </span>
                          <span
                            className={`font-mono text-xs ${out ? "font-bold text-destructive" : "text-muted-foreground"}`}
                          >
                            {formatted}
                            {bio.unit ? ` ${bio.unit}` : ""}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {categories.map((cat) => (
        <LazyCategory
          key={cat.id}
          category={cat}
          isDark={isDark}
          i18n={i18n}
          profileId={profileId}
          onMutate={onMutate}
        />
      ))}
    </>
  );
}
