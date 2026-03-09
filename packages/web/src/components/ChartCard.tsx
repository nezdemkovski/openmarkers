import { useRef, useEffect, useState, useMemo, memo } from "react";
import { TriangleAlert, CircleCheck, TrendingUp, TrendingDown, AlertTriangle, Info } from "lucide-react";
import type { LucideIcon } from "lucide-react";
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
import { isOutOfRange, analyzeTrend } from "@openmarkers/db/src/analytics";
import ResultEditor from "./ResultEditor.tsx";
import type { Biomarker, I18n, TrendResult } from "../types.ts";

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{ payload: { date: string; value: number } }>;
  biomarker: Biomarker;
  t: I18n["t"];
}

function CustomTooltip({ active, payload, biomarker, t }: CustomTooltipProps) {
  if (!active || !payload?.length) return null;
  const { date, value } = payload[0].payload;
  const out = isOutOfRange(value, biomarker.refMin, biomarker.refMax);
  const formatted =
    typeof value === "number" ? (Number.isInteger(value) ? value : value.toFixed(2).replace(/\.?0+$/, "")) : value;
  const refParts: string[] = [];
  if (biomarker.refMin != null) refParts.push(`Min: ${biomarker.refMin}`);
  if (biomarker.refMax != null) refParts.push(`Max: ${biomarker.refMax}`);

  return (
    <div className="bg-gray-800 dark:bg-gray-700 text-white text-xs rounded-lg px-3 py-2 shadow-lg">
      <p className="font-medium">{formatDate(date)}</p>
      <p className="mt-1">
        {formatted}
        {biomarker.unit ? ` ${biomarker.unit}` : ""}
        <span className={out ? " text-red-300" : " text-green-300"}> ({out ? t("outOfRange") : t("normal")})</span>
      </p>
      {refParts.length > 0 && (
        <p className="mt-0.5 text-gray-300">
          {t("ref")}: {refParts.join(" \u2013 ")}
        </p>
      )}
    </div>
  );
}

interface CustomDotProps {
  cx?: number;
  cy?: number;
  payload?: { value: number };
  biomarker: Biomarker;
}

function CustomDot({ cx, cy, payload, biomarker }: CustomDotProps) {
  if (cx == null || cy == null || !payload) return null;
  const out = isOutOfRange(payload.value, biomarker.refMin, biomarker.refMax);
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

  const { direction, rateChange, overallChange, trendWarning, improving } = trend;
  const absPct = Math.abs(rateChange);
  if (absPct < 0.5 && !trendWarning) return null;

  const lastStr = fmtPct(rateChange);
  const overallStr = overallChange != null ? fmtPct(overallChange) : null;

  let color: string;
  if (trendWarning) {
    color = "text-amber-700 dark:text-amber-400 bg-amber-100 dark:bg-amber-900/30";
  } else if (improving === true) {
    color = "text-green-700 dark:text-green-400 bg-green-100 dark:bg-green-900/30";
  } else if (improving === false) {
    color = "text-red-700 dark:text-red-400 bg-red-100 dark:bg-red-900/30";
  } else {
    color = "text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-700";
  }

  const Icon: LucideIcon = trendWarning ? AlertTriangle : direction === "up" ? TrendingUp : TrendingDown;

  return (
    <span className={`inline-flex items-center gap-1 text-xs font-medium px-1.5 py-0.5 rounded ${color}`}>
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
  return new Date(d).toLocaleDateString("en-GB", { month: "short", year: "2-digit" });
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

export default memo(function ChartCard({ biomarker, isDark, i18n, profileId, onMutate }: ChartCardProps) {
  const [editing, setEditing] = useState(false);
  const { t, tBio } = i18n;
  const descRef = useRef<HTMLParagraphElement>(null);
  const [clamped, setClamped] = useState(false);

  const { latest, out, trend, latestStr, refStr, data, minVal, maxVal, padding } = useMemo(() => {
    const _latest = biomarker.results[biomarker.results.length - 1];
    const _out = isOutOfRange(_latest?.value, biomarker.refMin, biomarker.refMax);
    const _trend = analyzeTrend(biomarker.results, biomarker.refMin, biomarker.refMax);
    const _latestStr = _latest
      ? `${typeof _latest.value === "number" ? _latest.value : _latest.value} ${biomarker.unit || ""}`
      : "\u2014";
    const _refParts: (number | null | undefined)[] = [];
    if (biomarker.refMin != null) _refParts.push(biomarker.refMin);
    if (biomarker.refMax != null) _refParts.push(biomarker.refMax);
    const _refStr = _refParts.join(" \u2013 ");
    const results = biomarker.results.filter((r) => typeof r.value === "number");
    const _data = results.map((r) => ({ date: r.date, value: r.value as number }));
    const allValues = _data.map((d) => d.value);
    if (biomarker.refMin != null) allValues.push(biomarker.refMin);
    if (biomarker.refMax != null) allValues.push(biomarker.refMax);
    const _minVal = Math.min(...allValues);
    const _maxVal = Math.max(...allValues);
    const _padding = (_maxVal - _minVal) * 0.2 || _maxVal * 0.1 || 1;
    return { latest: _latest, out: _out, trend: _trend, latestStr: _latestStr, refStr: _refStr, data: _data, minVal: _minVal, maxVal: _maxVal, padding: _padding };
  }, [biomarker]);

  useEffect(() => {
    if (descRef.current) {
      setClamped(descRef.current.scrollHeight > descRef.current.clientHeight);
    }
  }, [i18n]);

  const isWarning = trend?.trendWarning && !out;
  const cardBorder = out
    ? "border-red-300 dark:border-red-500/50"
    : isWarning
      ? "border-amber-300 dark:border-amber-500/50"
      : "border-gray-200 dark:border-gray-700";
  const cardBg = out
    ? "bg-red-50/50 dark:bg-red-950/20"
    : isWarning
      ? "bg-amber-50/50 dark:bg-amber-950/20"
      : "bg-white dark:bg-gray-800";

  const tickColor = isDark ? "#9ca3af" : "#6b7280";
  const gridColor = isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.05)";
  const tickStyle = useMemo(() => ({ fontSize: 11, fill: tickColor }), [tickColor]);

  return (
    <div className={`chart-card ${cardBg} rounded-xl border ${cardBorder} p-4 shadow-sm`}>
      <div className="flex items-start justify-between mb-1">
        <div className="flex items-center gap-1.5">
          {out ? (
            <TriangleAlert className="w-4 h-4 text-red-500 dark:text-red-400 shrink-0" />
          ) : isWarning ? (
            <AlertTriangle className="w-4 h-4 text-amber-500 dark:text-amber-400 shrink-0" />
          ) : (
            <CircleCheck className="w-4 h-4 text-green-500 dark:text-green-400 shrink-0" />
          )}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">{tBio(biomarker.id, "name")}</h3>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
              {biomarker.id}
              {biomarker.unit ? ` \u00b7 ${biomarker.unit}` : ""}
              {refStr ? ` \u00b7 ${t("ref")}: ${refStr}` : ""}
            </p>
          </div>
        </div>
        <div className="text-right shrink-0 ml-2 flex items-center gap-1.5">
          <TrendBadge trend={trend} t={t} />
          {out ? (
            <span className="inline-flex items-center gap-1 text-sm font-mono font-bold text-red-700 dark:text-red-400 bg-red-100 dark:bg-red-900/40 px-2 py-0.5 rounded-md">
              {latestStr}
            </span>
          ) : (
            <span className="text-sm font-mono text-gray-700 dark:text-gray-300">{latestStr}</span>
          )}
        </div>
      </div>
      <div className={`bio-desc mb-3${clamped ? " clamped" : ""}`}>
        <p ref={descRef} className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2">
          {tBio(biomarker.id, "description")}
        </p>
        {clamped && <div className="bio-desc-full">{tBio(biomarker.id, "description")}</div>}
      </div>
      {biomarker.note && (
        <div className="flex items-start gap-1.5 mb-3 px-2.5 py-1.5 rounded-md bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800/50">
          <Info className="w-3.5 h-3.5 text-blue-500 dark:text-blue-400 shrink-0 mt-0.5" />
          <p className="text-xs text-blue-700 dark:text-blue-300">{biomarker.note}</p>
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
              <Tooltip content={<CustomTooltip biomarker={biomarker} t={t} />} />
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
                stroke="rgb(59, 130, 246)"
                strokeWidth={2}
                dot={<CustomDot biomarker={biomarker} />}
                activeDot={ACTIVE_DOT}
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex items-center justify-center h-full text-sm text-gray-400">No data</div>
        )}
      </div>
      {profileId != null && onMutate && (
        <div className="mt-2 text-right">
          <button onClick={() => setEditing(true)} className="text-xs text-blue-500 dark:text-blue-400 hover:underline">{t("editResultsLink")}</button>
        </div>
      )}
      {editing && profileId != null && onMutate && (
        <ResultEditor
          biomarker={biomarker}
          profileId={profileId}
          i18n={i18n}
          onClose={() => setEditing(false)}
          onMutate={() => { onMutate(); setEditing(false); }}
        />
      )}
    </div>
  );
});
