import { memo, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ReferenceLine,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";
import { HeartPulse, ChevronDown } from "lucide-react";
import type { PhenoAgeResult, PhenoAgeScore, I18n } from "../types.ts";

const CHART_MARGIN = { top: 4, right: 4, bottom: 4, left: 4 };

interface BioAgeTooltipProps {
  active?: boolean;
  payload?: Array<{ payload: PhenoAgeResult }>;
  t: I18n["t"];
}

function BioAgeTooltip({ active, payload, t }: BioAgeTooltipProps) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  const delta = d.delta;
  const deltaColor = delta <= 0 ? "text-green-300" : "text-red-300";

  return (
    <div className="bg-gray-800 dark:bg-gray-700 text-white text-xs rounded-lg px-3 py-2 shadow-lg">
      <p className="font-medium">
        {new Date(d.date).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
      </p>
      <p className="mt-1">
        {t("bioAge")}: <span className="font-mono font-bold">{d.phenoAge}</span>
      </p>
      <p className="mt-0.5">
        {t("chronoAge")}: <span className="font-mono">{d.chronoAge}</span>
      </p>
      <p className={`mt-0.5 ${deltaColor}`}>
        {delta > 0 ? "+" : ""}{delta}
      </p>
    </div>
  );
}

function ScoreRow({ s, calcDate }: { s: PhenoAgeScore; calcDate: string }) {
  const color = s.score < 0 ? "text-green-600 dark:text-green-400" : "text-gray-700 dark:text-gray-200";
  const isSameDate = s.date === calcDate;
  const outOfRange = (s.refMin != null && s.value < s.refMin) || (s.refMax != null && s.value > s.refMax);
  const fmt = (n: number) => +n.toPrecision(4);
  const refStr = s.refMin != null && s.refMax != null
    ? `${fmt(s.refMin)}–${fmt(s.refMax)}`
    : s.refMin != null ? `≥${fmt(s.refMin)}` : s.refMax != null ? `≤${fmt(s.refMax)}` : "";
  return (
    <tr className="text-[11px]">
      <td className="pr-2 text-gray-600 dark:text-gray-300">{s.id}</td>
      <td className={`pr-2 font-mono text-right ${outOfRange ? "text-amber-600 dark:text-amber-400 font-semibold" : "text-gray-800 dark:text-gray-100"}`}>{s.value}</td>
      <td className="pr-2 text-gray-400 dark:text-gray-500">{s.unit}</td>
      <td className="pr-2 font-mono text-gray-400 dark:text-gray-500 text-[10px]">{refStr}</td>
      <td className={`pr-2 text-gray-400 dark:text-gray-500 ${isSameDate ? "" : "italic"}`}>
        {new Date(s.date).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "2-digit" })}
      </td>
      <td className={`font-mono text-right ${color}`}>{s.score > 0 ? "+" : ""}{s.score.toFixed(2)}</td>
    </tr>
  );
}

interface StatProps {
  label: string;
  value: string;
  sub?: string;
  subColor?: string;
}

function Stat({ label, value, sub, subColor }: StatProps) {
  return (
    <div className="text-center">
      <div className="text-[11px] text-gray-500 dark:text-gray-400">{label}</div>
      <div className="text-xl font-bold text-gray-900 dark:text-gray-100 leading-tight">{value}</div>
      {sub && (
        subColor
          ? <span className={`inline-block mt-1 text-[10px] font-medium px-2 py-0.5 rounded-full ${subColor}`}>{sub}</span>
          : <div className="text-[10px] text-gray-400 dark:text-gray-500 mt-0.5">{sub}</div>
      )}
    </div>
  );
}

interface BioAgeCardProps {
  results: PhenoAgeResult[];
  isDark: boolean;
  i18n: I18n;
}

export default memo(function BioAgeCard({ results, isDark, i18n }: BioAgeCardProps) {
  const [open, setOpen] = useState(false);
  if (results.length === 0) return null;

  const { t } = i18n;
  const latest = results[results.length - 1];
  const delta = latest.delta;
  const absDelta = Math.abs(delta);

  const deltaLabel =
    delta === 0
      ? t("bioAgeEqual")
      : delta > 0
        ? `+${absDelta} ${t("yearsOlder")}`
        : `-${absDelta} ${t("yearsYounger")}`;

  const deltaColor =
    delta <= 0
      ? "text-green-600 dark:text-green-400"
      : "text-red-600 dark:text-red-400";

  const deltaBg =
    delta <= 0
      ? "bg-green-100 dark:bg-green-900/30"
      : "bg-red-100 dark:bg-red-900/30";

  return (
    <div className="mb-6 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 shadow-sm">
      <div className="flex items-center gap-2 mb-1">
        <HeartPulse className="w-5 h-5 text-rose-500" />
        <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">{t("bioAge")}</h3>
        <span className="text-xs text-gray-400 dark:text-gray-500 ml-auto">{t("chronoAge")}: {latest.chronoAge}</span>
      </div>

      {/* Description with collapsible breakdown */}
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1.5 text-xs mb-3 px-2 py-1 -mx-1 rounded-md text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors"
      >
        <ChevronDown className={`w-3.5 h-3.5 shrink-0 transition-transform ${open ? "rotate-180" : ""}`} />
        {t("bioAgeDesc")}
      </button>
      {open && (
        <div className="mb-4 bg-white dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600 shadow-lg p-3">
          <div className="text-xs font-semibold text-gray-900 dark:text-gray-100 mb-1.5">
            Levine PhenoAge Calculation
          </div>
          <table className="w-full mb-2">
            <thead>
              <tr className="text-[10px] text-gray-400 dark:text-gray-500 border-b border-gray-200 dark:border-gray-600">
                <th className="text-left pr-2 pb-1 font-medium">Biomarker</th>
                <th className="text-right pr-2 pb-1 font-medium">Value</th>
                <th className="text-left pr-2 pb-1 font-medium">Unit</th>
                <th className="text-left pr-2 pb-1 font-medium">Ref</th>
                <th className="text-left pr-2 pb-1 font-medium">Date</th>
                <th className="text-right pb-1 font-medium">Score</th>
              </tr>
            </thead>
            <tbody>
              {latest.scores.map((s) => <ScoreRow key={s.id} s={s} calcDate={latest.date} />)}
            </tbody>
            <tfoot>
              <tr className="text-[11px] border-t border-gray-200 dark:border-gray-600 font-medium">
                <td colSpan={5} className="pt-1 text-gray-600 dark:text-gray-300">Intercept (-19.91) + Sum</td>
                <td className="pt-1 font-mono text-right text-gray-800 dark:text-gray-100">xb = {latest.xb}</td>
              </tr>
            </tfoot>
          </table>
          <div className="text-[10px] text-gray-500 dark:text-gray-400 space-y-0.5 border-t border-gray-200 dark:border-gray-600 pt-1.5">
            <p>M = 1 - exp(-exp(xb) × 197.2) = {latest.mortalityScore}%</p>
            <p>PhenoAge = 141.50 + ln(-0.00553 × ln(1-M)) / 0.0902 = <strong className="text-gray-800 dark:text-gray-100">{latest.phenoAge}</strong></p>
          </div>
          <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-2 italic">Levine et al. 2018, PMC5940111</p>
        </div>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 items-center text-center">
        <Stat label={t("bioAge")} value={`${latest.phenoAge}`} sub={deltaLabel} subColor={`${deltaBg} ${deltaColor}`} />
        <Stat label={t("mortalityScore")} value={`${latest.mortalityScore}%`} sub={t("mortalityScoreDesc")} />
        {results.length > 1 ? (
          <div className="col-span-2 sm:col-span-1 h-16">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={results} margin={{ top: 4, right: 4, bottom: 0, left: -24 }}>
                <XAxis
                  dataKey="date"
                  tickFormatter={(d: string) => new Date(d).toLocaleDateString("en-GB", { year: "2-digit" })}
                  tick={{ fontSize: 9, fill: isDark ? "#6b7280" : "#9ca3af" }}
                  axisLine={false}
                  tickLine={false}
                  interval="preserveStartEnd"
                />
                <YAxis
                  domain={["dataMin - 1", "dataMax + 1"]}
                  tick={{ fontSize: 9, fill: isDark ? "#6b7280" : "#9ca3af" }}
                  axisLine={false}
                  tickLine={false}
                  tickCount={3}
                />
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke={isDark ? "#374151" : "#e5e7eb"}
                  vertical={true}
                />
                <Tooltip content={<BioAgeTooltip t={t} />} />
                <ReferenceLine
                  y={latest.chronoAge}
                  stroke={isDark ? "#4b5563" : "#d1d5db"}
                  strokeDasharray="3 3"
                />
                <Line
                  type="monotone"
                  dataKey="phenoAge"
                  stroke={isDark ? "#f472b6" : "#e11d48"}
                  strokeWidth={1.5}
                  dot={{ r: 2, fill: isDark ? "#f472b6" : "#e11d48", strokeWidth: 0 }}
                  activeDot={{ r: 3, strokeWidth: 0 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div />
        )}
        <Stat label={t("dnamAge")} value={`${latest.dnamAge}`} sub={t("dnamAgeDesc")} />
        <Stat label={t("dnamMortality")} value={`${latest.dnamMortality}%`} sub={t("dnamMortalityDesc")} />
      </div>
    </div>
  );
});
