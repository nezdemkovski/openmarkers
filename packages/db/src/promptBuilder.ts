import type { UserData, I18n, Lang } from "./types";
import { LANGS } from "./i18n";
import { isOutOfRange, analyzeTrend, getAllDates, getRelevantCorrelations } from "./analytics";
import { calculatePhenoAge } from "./bioage";

function fmtVal(v: number | string | null | undefined): string {
  if (v == null) return "\u2014";
  if (typeof v === "number") return Number.isInteger(v) ? String(v) : (+v.toPrecision(4)).toString();
  return String(v);
}

function pushNote(lines: string[], bio: { note?: string }) {
  if (bio.note) lines.push(`  Note: ${bio.note}`);
}

function age(dob: string): number {
  const birth = new Date(dob);
  const now = new Date();
  let y = now.getFullYear() - birth.getFullYear();
  if (now.getMonth() < birth.getMonth() || (now.getMonth() === birth.getMonth() && now.getDate() < birth.getDate()))
    y--;
  return y;
}

export function buildPrompt(userData: UserData, enI18n: I18n, lang: Lang): string {
  const { t, tCat, tBio } = enI18n;
  const user = userData.user;
  const categories = userData.categories;
  const dates = getAllDates(categories);
  const correlations = getRelevantCorrelations(categories);

  const lines: string[] = [];

  lines.push("You are a medical data analyst. Analyze the following lab results for a patient.");
  lines.push("Provide a clear, structured analysis. Focus on:");
  lines.push("- Out-of-range values and their clinical significance");
  lines.push("- Trends over time (improving, worsening, stable)");
  lines.push("- Correlations between related biomarkers (e.g. iron panel, lipid panel)");
  lines.push("- Potential concerns or patterns worth discussing with a doctor");
  lines.push("- Positive findings (what looks good)");
  lines.push("");

  lines.push("## Patient Profile");
  lines.push(`- Name: ${user.name}`);
  lines.push(`- Age: ${age(user.dateOfBirth!)} (DOB: ${user.dateOfBirth})`);
  lines.push(`- Sex: ${user.sex === "M" ? "Male" : "Female"}`);
  lines.push(`- Lab dates: ${dates.join(", ")} (${dates.length} tests)`);
  lines.push("");

  const outOfRange: {
    bio: (typeof categories)[0]["biomarkers"][0];
    latest: (typeof categories)[0]["biomarkers"][0]["results"][0];
    trend: ReturnType<typeof analyzeTrend>;
    catId: string;
  }[] = [];
  const warnings: typeof outOfRange = [];
  for (const cat of categories) {
    for (const bio of cat.biomarkers) {
      const latest = bio.results[bio.results.length - 1];
      if (!latest || typeof latest.value !== "number") continue;
      const out = isOutOfRange(latest.value, bio.refMin, bio.refMax);
      const trend = analyzeTrend(bio.results, bio.refMin, bio.refMax);
      if (out) {
        outOfRange.push({ bio, latest, trend, catId: cat.id });
      } else if (trend?.trendWarning) {
        warnings.push({ bio, latest, trend, catId: cat.id });
      }
    }
  }

  if (outOfRange.length > 0) {
    lines.push("## \u26a0 Out-of-Range Values");
    for (const { bio, latest, trend } of outOfRange) {
      const ref = [bio.refMin != null ? `min: ${bio.refMin}` : null, bio.refMax != null ? `max: ${bio.refMax}` : null]
        .filter(Boolean)
        .join(", ");
      let trendStr = "";
      if (trend) {
        trendStr = ` | ${trend.direction} ${trend.rateChange > 0 ? "+" : ""}${trend.rateChange.toFixed(1)}% since last`;
        if (trend.overallChange != null)
          trendStr += `, ${trend.overallChange > 0 ? "+" : ""}${Math.abs(trend.overallChange) >= 100 ? Math.round(trend.overallChange) : trend.overallChange.toFixed(1)}% overall`;
      }
      lines.push(
        `- **${tBio(bio.id, "name")}** (${bio.id}): ${fmtVal(latest.value)} ${bio.unit || ""} [ref: ${ref}]${trendStr}`,
      );
      pushNote(lines, bio);
    }
    lines.push("");
  }

  if (warnings.length > 0) {
    lines.push("## \u26a1 Approaching Limits (in range but trending toward boundary)");
    for (const { bio, latest, trend } of warnings) {
      const ref = [bio.refMin != null ? `min: ${bio.refMin}` : null, bio.refMax != null ? `max: ${bio.refMax}` : null]
        .filter(Boolean)
        .join(", ");
      lines.push(
        `- **${tBio(bio.id, "name")}** (${bio.id}): ${fmtVal(latest.value)} ${bio.unit || ""} [ref: ${ref}] | trending ${trend!.direction}`,
      );
      pushNote(lines, bio);
    }
    lines.push("");
  }

  lines.push("## All Results by Category");
  lines.push("");
  for (const cat of categories) {
    lines.push(`### ${tCat(cat.id, "name")}`);
    for (const bio of cat.biomarkers) {
      const numResults = bio.results.filter((r) => typeof r.value === "number");
      const qualResults = bio.results.filter((r) => typeof r.value === "string");
      const ref = [bio.refMin != null ? bio.refMin : null, bio.refMax != null ? bio.refMax : null].filter(
        (v): v is number => v !== null,
      );
      const refStr = ref.length > 0 ? ` [ref: ${ref.join("\u2013")}]` : "";

      if (numResults.length > 0) {
        const history = numResults.map((r) => `${r.date}: ${fmtVal(r.value)}`).join(", ");
        const latest = numResults[numResults.length - 1];
        const out = isOutOfRange(latest.value, bio.refMin, bio.refMax);
        const flag = out ? " \u26a0" : "";
        lines.push(
          `- ${tBio(bio.id, "name")} (${bio.id})${bio.unit ? ` [${bio.unit}]` : ""}${refStr}${flag}: ${history}`,
        );
        pushNote(lines, bio);
      } else if (qualResults.length > 0) {
        const history = qualResults.map((r) => `${r.date}: ${r.value}`).join(", ");
        lines.push(`- ${tBio(bio.id, "name")} (${bio.id}): ${history}`);
        pushNote(lines, bio);
      }
    }
    lines.push("");
  }

  if (user.dateOfBirth) {
    const bioAgeResults = calculatePhenoAge(categories, user.dateOfBirth);
    if (bioAgeResults.length > 0) {
      lines.push("## Biological Age (Levine PhenoAge)");
      lines.push("Calculated using Levine's PhenoAge formula (2018) from 9 blood biomarkers.");
      lines.push("");
      for (const r of bioAgeResults) {
        const sign = r.delta > 0 ? "+" : "";
        lines.push(
          `- ${r.date}: PhenoAge **${r.phenoAge}** (chrono ${r.chronoAge}, delta ${sign}${r.delta}) | mortality ${r.mortalityScore}% | DNAm age ${r.dnamAge}`,
        );
      }
      const latest = bioAgeResults[bioAgeResults.length - 1];
      lines.push("");
      lines.push("Breakdown of latest calculation:");
      for (const s of latest.scores) {
        lines.push(`  - ${s.id}: ${s.value} ${s.unit} → score ${s.score > 0 ? "+" : ""}${s.score.toFixed(2)}`);
      }
      lines.push(`  - xb = ${latest.xb} (intercept -19.91 + sum of scores)`);
      lines.push("");
    }
  }

  if (correlations.length > 0) {
    lines.push("## Correlated Panels to Analyze Together");
    for (const group of correlations) {
      const names = group.matched.map((id) => tBio(id, "name") || id).join(", ");
      lines.push(`- **${t(group.id)}**: ${names}`);
    }
    lines.push("");
  }

  lines.push("## Analysis Instructions");
  lines.push("Please provide:");
  lines.push("1. **Summary** \u2014 Overall health picture in 2-3 sentences");
  lines.push("2. **Key Concerns** \u2014 Out-of-range values ranked by clinical significance, with possible causes");
  lines.push("3. **Trends** \u2014 Notable changes over time (improving or worsening patterns)");
  lines.push("4. **Correlations** \u2014 Related biomarkers that together suggest a specific condition");
  lines.push("5. **Positive Findings** \u2014 What looks good and healthy");
  lines.push(
    "6. **Actionable Recommendations** \u2014 For each out-of-range biomarker, suggest specific lifestyle changes, dietary adjustments, supplements, or habits that may help improve the value (e.g. foods to eat/avoid, exercise, sleep, sun exposure, stress management)",
  );
  lines.push("7. **Suggested Follow-up** \u2014 What to discuss with a doctor, additional tests to consider");

  if (lang && lang !== "en") {
    const langEntry = LANGS.find((l) => l.code === lang);
    lines.push("");
    lines.push(`IMPORTANT: Please write your entire response in ${langEntry?.name || lang}.`);
  }

  return lines.join("\n");
}
