import {
  TriangleAlert,
  CircleCheck,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Info,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useRef, useEffect, useState, useMemo, memo } from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ReferenceArea,
  ReferenceLine,
  CartesianGrid,
} from "recharts";

import { Button } from "@/components/ui/button";
import {
  Tooltip as UiTooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

import type { Biomarker, I18n, TrendResult } from "../types.ts";
import ResultEditor from "./ResultEditor.tsx";

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

interface ChartDataPoint {
  date: string;
  value: number;
  refMin?: number | null;
  refMax?: number | null;
  outOfRange?: boolean;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{ payload: ChartDataPoint }>;
  biomarker: Biomarker;
  t: I18n["t"];
}

function CustomTooltip({ active, payload, biomarker, t }: CustomTooltipProps) {
  if (!active || !payload?.length) return null;
  const point = payload[0].payload;
  const { date, value } = point;
  const effectiveRefMin = point.refMin ?? biomarker.refMin;
  const effectiveRefMax = point.refMax ?? biomarker.refMax;
  const out = point.outOfRange ?? false;
  const formatted =
    typeof value === "number"
      ? Number.isInteger(value)
        ? value
        : value.toFixed(2).replace(/\.?0+$/, "")
      : value;
  const refParts: string[] = [];
  if (effectiveRefMin != null) refParts.push(`Min: ${effectiveRefMin}`);
  if (effectiveRefMax != null) refParts.push(`Max: ${effectiveRefMax}`);

  return (
    <div className="bg-popover text-popover-foreground text-xs rounded-lg px-3 py-2 shadow-lg border border-border">
      <p className="font-medium">{formatDate(date)}</p>
      <p className="mt-1">
        {formatted}
        {biomarker.unit ? ` ${biomarker.unit}` : ""}
        <span
          className={
            out ? " text-destructive" : " text-green-600 dark:text-green-400"
          }
        >
          {" "}
          ({out ? t("outOfRange") : t("normal")})
        </span>
      </p>
      {refParts.length > 0 && (
        <p className="mt-0.5 text-muted-foreground">
          {t("ref")}: {refParts.join(" \u2013 ")}
        </p>
      )}
    </div>
  );
}

interface CustomDotProps {
  cx?: number;
  cy?: number;
  payload?: ChartDataPoint;
  biomarker: Biomarker;
}

function CustomDot({ cx, cy, payload }: CustomDotProps) {
  if (cx == null || cy == null || !payload) return null;
  const out = payload.outOfRange ?? false;
  return (
    <circle
      cx={cx}
      cy={cy}
      r={5}
      fill={out ? "rgb(220, 38, 38)" : "rgb(22, 163, 74)"}
      stroke={out ? "rgb(185, 28, 28)" : "rgb(21, 128, 61)"}
      strokeWidth={2}
    />
  );
}

function fmtPct(v: number): string {
  return `${v > 0 ? "+" : ""}${Math.abs(v) >= 100 ? Math.round(v) : v.toFixed(1)}%`;
}

interface TrendBadgeProps {
  trend: TrendResult | null;
  t: I18n["t"];
}

function TrendBadge({ trend, t }: TrendBadgeProps) {
  if (!trend) return null;

  const { direction, rateChange, overallChange, trendWarning, improving } =
    trend;
  const absPct = Math.abs(rateChange);
  if (absPct < 0.5 && !trendWarning) return null;

  const lastStr = fmtPct(rateChange);
  const overallStr = overallChange != null ? fmtPct(overallChange) : null;

  let color: string;
  if (trendWarning) {
    color =
      "text-amber-700 dark:text-amber-400 bg-amber-100 dark:bg-amber-900/30";
  } else if (improving === true) {
    color =
      "text-green-700 dark:text-green-400 bg-green-100 dark:bg-green-900/30";
  } else if (improving === false) {
    color = "text-destructive bg-destructive/10";
  } else {
    color = "text-muted-foreground bg-muted";
  }

  const Icon: LucideIcon = trendWarning
    ? AlertTriangle
    : direction === "up"
      ? TrendingUp
      : TrendingDown;

  return (
    <span
      className={`mt-1 inline-flex items-center gap-1 text-xs font-medium px-1.5 py-0.5 rounded ${color}`}
    >
      <Icon className="w-3 h-3 shrink-0" />
      <span>
        {lastStr} {t("sinceLast")}
      </span>
      {overallStr && (
        <span className="opacity-60">
          {"\u00b7"} {overallStr} {t("overall")}
        </span>
      )}
    </span>
  );
}

const CHART_MARGIN = { top: 5, right: 10, bottom: 5, left: 0 };
const ACTIVE_DOT = { r: 7, strokeWidth: 2 };
const AXIS_COMMON = { axisLine: false, tickLine: false } as const;

function formatXTick(d: string) {
  return new Date(d).toLocaleDateString("en-GB", {
    month: "short",
    year: "2-digit",
  });
}

function formatYTick(v: number) {
  return String(+v.toPrecision(4));
}

interface ChartCardProps {
  biomarker: Biomarker;
  isDark: boolean;
  i18n: I18n;
  profileId?: number;
  onMutate?: () => void;
}

export default memo(function ChartCard({
  biomarker,
  isDark,
  i18n,
  profileId,
  onMutate,
}: ChartCardProps) {
  const [editing, setEditing] = useState(false);
  const { t, tBio } = i18n;
  const descRef = useRef<HTMLParagraphElement>(null);
  const [clamped, setClamped] = useState(false);

  const {
    latest,
    out,
    trend,
    latestStr,
    refStr,
    data,
    minVal,
    maxVal,
    padding,
  } = useMemo(() => {
    const _latest = biomarker.results[biomarker.results.length - 1];
    const _out = biomarker.latestOutOfRange ?? false;
    const _trend = biomarker.trend ?? null;
    const _latestStr = _latest
      ? `${typeof _latest.value === "number" ? _latest.value : _latest.value} ${biomarker.unit || ""}`
      : "\u2014";
    const _refParts: (number | null | undefined)[] = [];
    if (biomarker.refMin != null) _refParts.push(biomarker.refMin);
    if (biomarker.refMax != null) _refParts.push(biomarker.refMax);
    const _refStr = _refParts.join(" \u2013 ");
    const results = biomarker.results.filter(
      (r): r is typeof r & { value: number } => typeof r.value === "number",
    );
    const _data: ChartDataPoint[] = results.map((r) => ({
      date: r.date,
      value: r.value,
      refMin: r.refMin,
      refMax: r.refMax,
      outOfRange: r.outOfRange,
    }));
    const allValues = _data.map((d) => d.value);
    if (biomarker.refMin != null) allValues.push(biomarker.refMin);
    if (biomarker.refMax != null) allValues.push(biomarker.refMax);
    const _minVal = Math.min(...allValues);
    const _maxVal = Math.max(...allValues);
    const _padding = (_maxVal - _minVal) * 0.2 || _maxVal * 0.1 || 1;
    return {
      latest: _latest,
      out: _out,
      trend: _trend,
      latestStr: _latestStr,
      refStr: _refStr,
      data: _data,
      minVal: _minVal,
      maxVal: _maxVal,
      padding: _padding,
    };
  }, [biomarker]);

  useEffect(() => {
    if (descRef.current) {
      setClamped(descRef.current.scrollHeight > descRef.current.clientHeight);
    }
  }, [i18n]);

  const isWarning = trend?.trendWarning && !out;
  const cardBorder = out
    ? "border-destructive/40"
    : isWarning
      ? "border-amber-300 dark:border-amber-500/50"
      : "border-border";
  const cardBg = out
    ? "bg-destructive/5"
    : isWarning
      ? "bg-amber-50/50 dark:bg-amber-950/20"
      : "bg-card";

  const tickColor = isDark ? "#9ca3af" : "#6b7280";
  const gridColor = isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.05)";
  const tickStyle = useMemo(
    () => ({ fontSize: 11, fill: tickColor }),
    [tickColor],
  );
  const lineColor = isDark ? "hsl(0 0% 70%)" : "hsl(0 0% 35%)";

  const descriptionText = tBio(biomarker.id, "description");

  return (
    <div
      className={cn(
        "chart-card rounded-xl border p-4 shadow-sm",
        cardBg,
        cardBorder,
      )}
    >
      <div className="mb-1">
        <div className="flex items-start gap-1.5">
          <div className="shrink-0 mt-0.5">
            {out ? (
              <TriangleAlert className="w-4 h-4 text-destructive" />
            ) : isWarning ? (
              <AlertTriangle className="w-4 h-4 text-amber-500 dark:text-amber-400" />
            ) : (
              <CircleCheck className="w-4 h-4 text-green-500 dark:text-green-400" />
            )}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-2">
              <h3 className="text-sm font-semibold text-foreground break-words min-w-0">
                {tBio(biomarker.id, "name")}
              </h3>
              {out ? (
                <span className="shrink-0 inline-flex items-center gap-1 text-sm font-mono font-bold text-destructive bg-destructive/10 px-2 py-0.5 rounded-md">
                  {latestStr}
                </span>
              ) : (
                <span className="shrink-0 text-sm font-mono text-foreground">
                  {latestStr}
                </span>
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              {biomarker.id}
              {biomarker.unit ? ` \u00b7 ${biomarker.unit}` : ""}
              {refStr ? ` \u00b7 ${t("ref")}: ${refStr}` : ""}
            </p>
            <TrendBadge trend={trend} t={t} />
          </div>
        </div>
      </div>
      <div className="mb-3">
        {clamped ? (
          <UiTooltip>
            <TooltipTrigger
              render={<p />}
              ref={descRef}
              className="text-xs text-muted-foreground line-clamp-2 cursor-default"
            >
              {descriptionText}
            </TooltipTrigger>
            <TooltipContent side="bottom" className="max-w-sm">
              {descriptionText}
            </TooltipContent>
          </UiTooltip>
        ) : (
          <p
            ref={descRef}
            className="text-xs text-muted-foreground line-clamp-2"
          >
            {descriptionText}
          </p>
        )}
      </div>
      {biomarker.note && (
        <div className="flex items-start gap-1.5 mb-3 px-2.5 py-1.5 rounded-md bg-muted border border-border">
          <Info className="w-3.5 h-3.5 text-muted-foreground shrink-0 mt-0.5" />
          <p className="text-xs text-muted-foreground">{biomarker.note}</p>
        </div>
      )}
      <div className="h-48">
        {data.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={CHART_MARGIN}>
              <CartesianGrid vertical={false} stroke={gridColor} />
              <XAxis
                dataKey="date"
                tickFormatter={formatXTick}
                tick={tickStyle}
                {...AXIS_COMMON}
              />
              <YAxis
                domain={[minVal - padding, maxVal + padding]}
                tickFormatter={formatYTick}
                tick={tickStyle}
                {...AXIS_COMMON}
                width={40}
              />
              <Tooltip
                content={<CustomTooltip biomarker={biomarker} t={t} />}
              />
              {biomarker.refMin != null && biomarker.refMax != null && (
                <ReferenceArea
                  y1={biomarker.refMin}
                  y2={biomarker.refMax}
                  fill="rgba(34, 197, 94, 0.08)"
                  stroke="rgba(34, 197, 94, 0.3)"
                  strokeWidth={1}
                />
              )}
              {biomarker.refMax != null && biomarker.refMin == null && (
                <ReferenceLine
                  y={biomarker.refMax}
                  stroke="rgba(34, 197, 94, 0.5)"
                  strokeDasharray="6 4"
                  strokeWidth={2}
                  label={{
                    value: `Max: ${biomarker.refMax}`,
                    position: "right",
                    fontSize: 10,
                    fill: "rgba(34, 197, 94, 0.8)",
                  }}
                />
              )}
              {biomarker.refMin != null && biomarker.refMax == null && (
                <ReferenceLine
                  y={biomarker.refMin}
                  stroke="rgba(34, 197, 94, 0.5)"
                  strokeDasharray="6 4"
                  strokeWidth={2}
                  label={{
                    value: `Min: ${biomarker.refMin}`,
                    position: "right",
                    fontSize: 10,
                    fill: "rgba(34, 197, 94, 0.8)",
                  }}
                />
              )}
              <Line
                type="monotone"
                dataKey="value"
                stroke={lineColor}
                strokeWidth={2}
                dot={<CustomDot biomarker={biomarker} />}
                activeDot={ACTIVE_DOT}
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex items-center justify-center h-full text-sm text-muted-foreground">
            No data
          </div>
        )}
      </div>
      {profileId != null && onMutate && (
        <div className="mt-2 text-right">
          <Button
            variant="link"
            size="sm"
            onClick={() => setEditing(true)}
            className="text-xs text-muted-foreground"
          >
            {t("editResultsLink")}
          </Button>
        </div>
      )}
      {editing && profileId != null && onMutate && (
        <ResultEditor
          biomarker={biomarker}
          profileId={profileId}
          i18n={i18n}
          onClose={() => setEditing(false)}
          onMutate={() => {
            onMutate();
            setEditing(false);
          }}
        />
      )}
    </div>
  );
});
