import { useState, useMemo } from "react";
import { ArrowUpRight, ArrowDownRight, Minus, TriangleAlert, CircleCheck } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { useQuery } from "@tanstack/react-query";
import { getAllDates, compareDates as compareDatesLocal } from "@openmarkers/db/src/analytics";
import { api } from "../lib/api.ts";
import type { Category, I18n, ComparisonRow } from "../types.ts";

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function formatDateShort(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "2-digit",
  });
}

interface ComparisonViewProps {
  categories: Category[];
  isDark: boolean;
  i18n: I18n;
  profileId?: number;
}

function getDelta(row: ComparisonRow) {
  let deltaStr = "";
  let deltaColor = "text-muted-foreground";
  let DeltaIcon: LucideIcon = Minus;

  if (row.delta != null) {
    const abs = Math.abs(row.delta);
    const pctAbs = row.deltaPct != null ? Math.abs(row.deltaPct) : null;
    deltaStr = `${row.delta > 0 ? "+" : ""}${Number.isInteger(row.delta) ? row.delta : +row.delta.toPrecision(3)}`;
    if (pctAbs != null && pctAbs >= 0.5) {
      deltaStr += ` (${row.delta > 0 ? "+" : ""}${row.deltaPct!.toFixed(1)}%)`;
    }

    if (abs < 0.001) {
      deltaColor = "text-muted-foreground";
      DeltaIcon = Minus;
    } else if (!row.out1 && row.out2) {
      deltaColor = "text-destructive";
      DeltaIcon = row.delta > 0 ? ArrowUpRight : ArrowDownRight;
    } else if (row.out1 && !row.out2) {
      deltaColor = "text-green-600 dark:text-green-400";
      DeltaIcon = row.delta > 0 ? ArrowUpRight : ArrowDownRight;
    } else {
      deltaColor = "text-muted-foreground";
      DeltaIcon = row.delta > 0 ? ArrowUpRight : ArrowDownRight;
    }
  }

  return { deltaStr, deltaColor, DeltaIcon };
}

export default function ComparisonView({ categories, isDark, i18n, profileId }: ComparisonViewProps) {
  const { t, tCat, tBio } = i18n;

  const localDates = useMemo(() => getAllDates(categories), [categories]);

  const { data: fetchedDates } = useQuery({
    queryKey: ["timeline", profileId],
    queryFn: () => api.getTimeline(profileId!),
    enabled: !!profileId,
  });

  const dates = fetchedDates ?? localDates;

  const [date1, setDate1] = useState("");
  const [date2, setDate2] = useState("");

  const activeDate1 = date1 || (dates.length >= 2 ? dates[0] : dates[0] || "");
  const activeDate2 = date2 || (dates.length >= 2 ? dates[dates.length - 1] : "");

  const canCompare = !!activeDate1 && !!activeDate2 && activeDate1 !== activeDate2;

  const localRows = useMemo(
    () => (!profileId && canCompare ? compareDatesLocal(categories, activeDate1, activeDate2) : []),
    [profileId, categories, activeDate1, activeDate2, canCompare],
  );

  const { data: fetchedRows } = useQuery({
    queryKey: ["compare", profileId, activeDate1, activeDate2],
    queryFn: () => api.compareDates(profileId!, activeDate1, activeDate2),
    enabled: !!profileId && canCompare,
  });

  const rows = fetchedRows ?? localRows;

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
        <h2 className="text-2xl font-bold text-foreground">{t("comparison")}</h2>
        <p className="text-sm text-muted-foreground mt-1">{t("comparisonDesc")}</p>
      </div>

      <Card className="mb-6 py-0">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
            <div className="grid grid-cols-[auto_1fr] items-center gap-2">
              <Label className="shrink-0">{t("from")}</Label>
              <Select value={activeDate1} onValueChange={(v) => setDate1(v)}>
                <SelectTrigger className="!w-full sm:!w-fit">
                  <SelectValue placeholder={t("from")} />
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
            <div className="grid grid-cols-[auto_1fr] items-center gap-2">
              <Label className="shrink-0">{t("to")}</Label>
              <Select value={activeDate2} onValueChange={(v) => setDate2(v)}>
                <SelectTrigger className="!w-full sm:!w-fit">
                  <SelectValue placeholder={t("to")} />
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
            {rows.length > 0 && (
              <div className="flex items-center gap-3 sm:ml-auto text-xs">
                {improved > 0 && (
                  <Badge variant="success">
                    {improved} {t("improved")}
                  </Badge>
                )}
                {worsened > 0 && (
                  <Badge variant="destructive">
                    {worsened} {t("worsened")}
                  </Badge>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {activeDate1 === activeDate2 && (
        <div className="text-center text-sm text-muted-foreground py-8">{t("selectDifferentDates")}</div>
      )}

      {grouped.map(([catId, catRows]) => (
        <Card key={catId} className="mb-4 overflow-hidden py-0 gap-0">
          <div className="px-4 py-2.5 bg-muted border-b border-border">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              {tCat(catId, "name")}
            </span>
          </div>

          <div className="hidden sm:block overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="px-4 py-2 text-left font-medium">{t("test")}</TableHead>
                  <TableHead className="px-4 py-2 text-right font-medium whitespace-nowrap">
                    {formatDate(activeDate1)}
                  </TableHead>
                  <TableHead className="px-4 py-2 text-right font-medium whitespace-nowrap">
                    {formatDate(activeDate2)}
                  </TableHead>
                  <TableHead className="px-4 py-2 text-right font-medium">{t("change")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {catRows.map((row) => {
                  const { deltaStr, deltaColor, DeltaIcon } = getDelta(row);
                  return (
                    <TableRow key={row.biomarkerId}>
                      <TableCell className="px-4 py-2.5">
                        <div className="text-sm text-foreground">{tBio(row.biomarkerId, "name")}</div>
                        <div className="text-xs text-muted-foreground">{row.biomarkerId}</div>
                      </TableCell>
                      <TableCell
                        className={`px-4 py-2.5 text-right text-sm font-mono whitespace-nowrap ${row.out1 ? "text-destructive font-bold" : "text-foreground"}`}
                      >
                        {fmtVal(row.v1, row.unit)}
                      </TableCell>
                      <TableCell
                        className={`px-4 py-2.5 text-right text-sm font-mono whitespace-nowrap ${row.out2 ? "text-destructive font-bold" : "text-foreground"}`}
                      >
                        {fmtVal(row.v2, row.unit)}
                      </TableCell>
                      <TableCell className={`px-4 py-2.5 text-right text-sm font-mono whitespace-nowrap ${deltaColor}`}>
                        <span className="inline-flex items-center gap-1">
                          {deltaStr && <DeltaIcon className="w-3.5 h-3.5" />}
                          {deltaStr || "\u2014"}
                        </span>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>

          <div className="sm:hidden divide-y divide-border">
            {catRows.map((row) => {
              const { deltaStr, deltaColor, DeltaIcon } = getDelta(row);
              return (
                <div key={row.biomarkerId} className="px-4 py-3 space-y-1.5">
                  <div className="flex items-start gap-2">
                    <div className="shrink-0 mt-0.5">
                      {row.out2 ? (
                        <TriangleAlert className="w-3.5 h-3.5 text-destructive" />
                      ) : (
                        <CircleCheck className="w-3.5 h-3.5 text-green-500 dark:text-green-400" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <div className="text-sm font-medium text-foreground">{tBio(row.biomarkerId, "name")}</div>
                      <div className="text-xs text-muted-foreground">{row.biomarkerId}</div>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-x-2 gap-y-1 pl-[22px] text-sm">
                    <span className={`font-mono ${row.out1 ? "text-destructive font-bold" : "text-muted-foreground"}`}>
                      {fmtVal(row.v1)}
                    </span>
                    <span className="text-muted-foreground/40">{"\u2192"}</span>
                    <span className={`font-mono ${row.out2 ? "text-destructive font-bold" : "text-foreground"}`}>
                      {fmtVal(row.v2, row.unit)}
                    </span>
                    {deltaStr && (
                      <span className={`ml-auto font-mono text-xs inline-flex items-center gap-0.5 ${deltaColor}`}>
                        <DeltaIcon className="w-3 h-3" />
                        {deltaStr}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      ))}
    </>
  );
}
