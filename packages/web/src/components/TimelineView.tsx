import { useState, useMemo } from "react";
import { Calendar, TriangleAlert, CircleCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
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

  const snapshot = useMemo(() => (activeDate ? getDateSnapshot(categories, activeDate) : []), [categories, activeDate]);

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
        <h2 className="text-2xl font-bold text-foreground">{t("timeline")}</h2>
        <p className="text-sm text-muted-foreground mt-1">{t("timelineDesc")}</p>
      </div>

      {/* Mobile: dropdown select */}
      <Card className="mb-6 sm:hidden py-0">
        <CardContent className="p-4">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-muted-foreground shrink-0" />
            <Select value={activeDate ?? ""} onValueChange={(v) => setSelectedDate(v)}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder={t("timeline")} />
              </SelectTrigger>
              <SelectContent>
                {dates.map((d) => (
                  <SelectItem key={d} value={d}>
                    {formatDate(d)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Desktop: toggle group */}
      <Card className="mb-6 hidden sm:block py-0">
        <CardContent className="p-4 overflow-x-auto">
          <ToggleGroup
            variant="outline"
            size="sm"
            spacing={1}
            value={activeDate ? [activeDate] : []}
            onValueChange={(newValue) => {
              const picked = (newValue as string[]).find((v) => v !== activeDate);
              if (picked) setSelectedDate(picked);
            }}
            className="w-max"
          >
            {dates.map((d) => (
              <ToggleGroupItem key={d} value={d} className="flex flex-col items-center gap-1 px-3 py-2 h-auto">
                <Calendar className="w-3.5 h-3.5" />
                <span>{formatShort(d)}</span>
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
        </CardContent>
      </Card>

      {activeDate && (
        <Card className="py-0 gap-0">
          <CardHeader className="px-4 py-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h3 className="text-sm font-semibold text-foreground">
                {t("snapshot")} {"\u2014"} {formatDate(activeDate)}
              </h3>
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">
                  {snapshot.length} {t("biomarkers")}
                </span>
                {outCount > 0 && (
                  <Badge variant="destructive">
                    {outCount} {t("flagged")}
                  </Badge>
                )}
                {outCount === 0 && snapshot.length > 0 && <Badge variant="success">{t("allOk")}</Badge>}
              </div>
            </div>
          </CardHeader>

          {grouped.map(([catId, items]) => (
            <div key={catId}>
              <div className="px-4 py-2 bg-muted border-b border-border">
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  {tCat(catId, "name")}
                </span>
              </div>
              <div className="divide-y divide-border">
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
                    <div key={item.biomarkerId} className="px-4 py-2.5 flex items-start gap-2">
                      <div className="shrink-0 mt-0.5">
                        {item.outOfRange ? (
                          <TriangleAlert className="w-3.5 h-3.5 text-destructive" />
                        ) : (
                          <CircleCheck className="w-3.5 h-3.5 text-green-500 dark:text-green-400" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-baseline justify-between gap-2">
                          <span className="text-sm text-foreground min-w-0 break-words">
                            {tBio(item.biomarkerId, "name")}
                          </span>
                          <span
                            className={`text-sm font-mono shrink-0 ${
                              item.outOfRange ? "font-bold text-destructive" : "text-foreground"
                            }`}
                          >
                            {formatted}
                            {item.unit ? ` ${item.unit}` : ""}
                          </span>
                        </div>
                        {refParts.length > 0 && (
                          <span className="text-xs text-muted-foreground">
                            {t("ref")}: {refParts.join(" \u2013 ")}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}

          {snapshot.length === 0 && (
            <div className="px-4 py-8 text-center text-sm text-muted-foreground">{t("noDataForDate")}</div>
          )}
        </Card>
      )}
    </>
  );
}
