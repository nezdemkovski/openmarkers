import { memo, useState } from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ReferenceLine, CartesianGrid, ResponsiveContainer } from "recharts";
import { HeartPulse, ChevronDown } from "lucide-react";
import type { PhenoAgeResult, PhenoAgeScore, I18n } from "../types.ts";
import { Card } from "@/components/ui/card";
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from "@/components/ui/collapsible";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableFooter, TableCell } from "@/components/ui/table";

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
  const deltaColor = delta <= 0 ? "text-green-600 dark:text-green-400" : "text-destructive";

  return (
    <div className="bg-popover text-popover-foreground text-xs rounded-lg px-3 py-2 shadow-lg border border-border">
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
        {delta > 0 ? "+" : ""}
        {delta}
      </p>
    </div>
  );
}

function ScoreRow({ s, calcDate }: { s: PhenoAgeScore; calcDate: string }) {
  const color = s.score < 0 ? "text-green-600 dark:text-green-400" : "text-foreground";
  const isSameDate = s.date === calcDate;
  const outOfRange = (s.refMin != null && s.value < s.refMin) || (s.refMax != null && s.value > s.refMax);
  const fmt = (n: number) => +n.toPrecision(4);
  const refStr =
    s.refMin != null && s.refMax != null
      ? `${fmt(s.refMin)}–${fmt(s.refMax)}`
      : s.refMin != null
        ? `≥${fmt(s.refMin)}`
        : s.refMax != null
          ? `≤${fmt(s.refMax)}`
          : "";
  return (
    <TableRow className="text-[11px] border-0 hover:bg-transparent">
      <TableCell className="pr-2 py-0.5 text-muted-foreground">{s.id}</TableCell>
      <TableCell
        className={`pr-2 py-0.5 font-mono text-right ${outOfRange ? "text-amber-600 dark:text-amber-400 font-semibold" : "text-foreground"}`}
      >
        {s.value}
      </TableCell>
      <TableCell className="pr-2 py-0.5 text-muted-foreground/60">{s.unit}</TableCell>
      <TableCell className="pr-2 py-0.5 font-mono text-muted-foreground/60 text-[10px]">{refStr}</TableCell>
      <TableCell className={`pr-2 py-0.5 text-muted-foreground/60 ${isSameDate ? "" : "italic"}`}>
        {new Date(s.date).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "2-digit" })}
      </TableCell>
      <TableCell className={`py-0.5 font-mono text-right ${color}`}>
        {s.score > 0 ? "+" : ""}
        {s.score.toFixed(2)}
      </TableCell>
    </TableRow>
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
      <div className="text-[11px] text-muted-foreground">{label}</div>
      <div className="text-xl font-bold text-foreground leading-tight">{value}</div>
      {sub &&
        (subColor ? (
          <span className={`inline-block mt-1 text-[10px] font-medium px-2 py-0.5 rounded-full ${subColor}`}>
            {sub}
          </span>
        ) : (
          <div className="text-[10px] text-muted-foreground/60 mt-0.5">{sub}</div>
        ))}
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

  const deltaColor = delta <= 0 ? "text-green-600 dark:text-green-400" : "text-destructive";

  const deltaBg = delta <= 0 ? "bg-green-100 dark:bg-green-900/30" : "bg-destructive/10";

  const tickColor = isDark ? "#6b7280" : "#9ca3af";
  const gridColor = isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)";
  const refLineColor = isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)";
  const lineColor = isDark ? "#f472b6" : "#e11d48";

  return (
    <Card className="mb-6 p-4">
      <div className="flex items-center gap-2 mb-1">
        <HeartPulse className="w-5 h-5 text-rose-500" />
        <h3 className="text-sm font-semibold text-foreground">{t("bioAge")}</h3>
        <span className="text-xs text-muted-foreground ml-auto">
          {t("chronoAge")}: {latest.chronoAge}
        </span>
      </div>

      <Collapsible open={open} onOpenChange={setOpen}>
        <CollapsibleTrigger className="flex items-center gap-1.5 text-xs mb-3 px-2 py-1 -mx-1 rounded-md text-muted-foreground hover:bg-muted transition-colors">
          <ChevronDown className={`w-3.5 h-3.5 shrink-0 transition-transform ${open ? "rotate-180" : ""}`} />
          {t("bioAgeDesc")}
        </CollapsibleTrigger>
        <CollapsibleContent>
          <Card className="mb-4 p-3 shadow-lg">
            <div className="text-xs font-semibold text-foreground mb-1.5">Levine PhenoAge Calculation</div>
            <div className="overflow-x-auto">
              <Table className="mb-2">
                <TableHeader>
                  <TableRow className="text-[10px] text-muted-foreground border-b border-border hover:bg-transparent">
                    <TableHead className="text-left pr-2 pb-1 h-auto font-medium">Biomarker</TableHead>
                    <TableHead className="text-right pr-2 pb-1 h-auto font-medium">Value</TableHead>
                    <TableHead className="text-left pr-2 pb-1 h-auto font-medium">Unit</TableHead>
                    <TableHead className="text-left pr-2 pb-1 h-auto font-medium">Ref</TableHead>
                    <TableHead className="text-left pr-2 pb-1 h-auto font-medium">Date</TableHead>
                    <TableHead className="text-right pb-1 h-auto font-medium">Score</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {latest.scores.map((s) => (
                    <ScoreRow key={s.id} s={s} calcDate={latest.date} />
                  ))}
                </TableBody>
                <TableFooter className="bg-transparent">
                  <TableRow className="text-[11px] border-t border-border font-medium hover:bg-transparent">
                    <TableCell colSpan={5} className="pt-1 py-0.5 text-muted-foreground">
                      Intercept (-19.91) + Sum
                    </TableCell>
                    <TableCell className="pt-1 py-0.5 font-mono text-right text-foreground">xb = {latest.xb}</TableCell>
                  </TableRow>
                </TableFooter>
              </Table>
            </div>
            <div className="text-[10px] text-muted-foreground space-y-0.5 border-t border-border pt-1.5 overflow-x-auto">
              <p>M = 1 - exp(-exp(xb) × 197.2) = {latest.mortalityScore}%</p>
              <p>
                PhenoAge = 141.50 + ln(-0.00553 × ln(1-M)) / 0.0902 ={" "}
                <strong className="text-foreground">{latest.phenoAge}</strong>
              </p>
            </div>
            <p className="text-[10px] text-muted-foreground/60 mt-2 italic">Levine et al. 2018, PMC5940111</p>
          </Card>
        </CollapsibleContent>
      </Collapsible>

      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 sm:gap-4 items-center text-center">
        <Stat label={t("bioAge")} value={`${latest.phenoAge}`} sub={deltaLabel} subColor={`${deltaBg} ${deltaColor}`} />
        <Stat label={t("mortalityScore")} value={`${latest.mortalityScore}%`} sub={t("mortalityScoreDesc")} />
        {results.length > 1 ? (
          <div className="col-span-2 sm:col-span-1 h-16">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={results} margin={{ top: 4, right: 4, bottom: 0, left: -24 }}>
                <XAxis
                  dataKey="date"
                  tickFormatter={(d: string) => new Date(d).toLocaleDateString("en-GB", { year: "2-digit" })}
                  tick={{ fontSize: 9, fill: tickColor }}
                  axisLine={false}
                  tickLine={false}
                  interval="preserveStartEnd"
                />
                <YAxis
                  domain={["dataMin - 1", "dataMax + 1"]}
                  tick={{ fontSize: 9, fill: tickColor }}
                  axisLine={false}
                  tickLine={false}
                  tickCount={3}
                />
                <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={true} />
                <Tooltip content={<BioAgeTooltip t={t} />} />
                <ReferenceLine y={latest.chronoAge} stroke={refLineColor} strokeDasharray="3 3" />
                <Line
                  type="monotone"
                  dataKey="phenoAge"
                  stroke={lineColor}
                  strokeWidth={1.5}
                  dot={{ r: 2, fill: lineColor, strokeWidth: 0 }}
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
    </Card>
  );
});
