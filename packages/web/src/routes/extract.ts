import { anthropic } from "@ai-sdk/anthropic";
import { checkExtractLimit, incrementExtractCount } from "@openmarkers/db";
import {
  buildCompactReference,
  buildMolecularWeightMap,
  getValidBiomarkerIds,
  getBiomarkerById,
} from "@openmarkers/db/src/biomarkerRegistry";
import { convert as convertUnit } from "@openmarkers/db/src/units";
import { generateText, Output } from "ai";
import { parse, format, isValid } from "date-fns";
import { z } from "zod";

import { json, error, parseBody, isResponse } from "./_shared.ts";

const BIOMARKER_REF = buildCompactReference();
const BIOMARKER_REF_TEXT = JSON.stringify(BIOMARKER_REF);
const VALID_IDS = getValidBiomarkerIds();
const MW_MAP = buildMolecularWeightMap();

function normalizeDate(d: string): string {
  if (!d) return "";
  const formats = [
    "yyyy-MM-dd",
    "dd.MM.yyyy",
    "dd/MM/yyyy",
    "MM/dd/yyyy",
    "d.M.yyyy",
    "d/M/yyyy",
    "yyyy/MM/dd",
  ];
  for (const fmt of formats) {
    const parsed = parse(d, fmt, new Date());
    if (isValid(parsed)) return format(parsed, "yyyy-MM-dd");
  }
  return "";
}

const extractRequestSchema = z.object({
  file: z.string().min(1),
  fileName: z.string().min(1),
});

interface ValidatedResult {
  biomarkerId: string;
  categoryId: string;
  date: string;
  value: number | string;
  unit: string;
  suspicious: boolean;
}

function isOutOfExpectedRange(
  value: number,
  refMin?: number,
  refMax?: number,
): boolean {
  if (refMin != null && refMax != null) {
    const range = refMax - refMin;
    return value < refMin - range * 3 || value > refMax + range * 3;
  }
  if (refMax != null) return value > refMax * 5;
  if (refMin != null) return value < refMin * 0.1;
  return false;
}

function tryAutoConvert(
  value: number,
  bioId: string,
): { value: number; converted: boolean } {
  const ref = BIOMARKER_REF[bioId];
  if (!ref?.conventionalUnit || !ref.unit) return { value, converted: false };

  const mw = MW_MAP[bioId];
  const converted = convertUnit(value, ref.conventionalUnit, ref.unit, mw);
  if (converted != null && !isOutOfExpectedRange(converted, ref.refMin, ref.refMax)) {
    return { value: converted, converted: true };
  }

  return { value, converted: false };
}

const extractionSchema = z.object({
  results: z.array(
    z.object({
      biomarker_id: z.string(),
      value: z.string(),
      date: z.string(),
    }),
  ),
});

const PROMPT = `You are a precise lab report data extractor. Return a JSON object with ALL extracted biomarker results.

VALID BIOMARKER IDs (use ONLY these exact IDs):
${BIOMARKER_REF_TEXT}

RULES:
1. Match test names to the CLOSEST biomarker ID from the list above. If no match, SKIP it.
2. Quantitative biomarkers: value as numeric string like "5.2". Skip "-", "norm", or non-numeric text.
3. Qualitative biomarkers (marked "qualitative":true): value as string like "negative", "positive".
4. WBC differential: percentages → B-lymf, B-neu, B-eo, B-mono, B-baso. Absolute counts → B-LYabs, B-NEabs, B-EOabs, B-MOabs, B-BAabs.
5. Each biomarker ID only ONCE per date.
6. Extract the test date from the document. If not found, use empty string.
7. NEVER invent values. Only extract what is clearly visible.
8. Extract ALL results — do not stop early.

Extract ALL results from this document:`;

export async function handleExtract(
  req: Request,
  auth: { userId: string },
): Promise<Response> {
  const allowed = await checkExtractLimit(auth.userId);
  if (!allowed) {
    return error("Monthly extraction limit reached", 429);
  }

  const body = await parseBody(req, extractRequestSchema);
  if (isResponse(body)) return body;

  let mediaType = "image/jpeg";
  let base64Data = body.file;

  if (body.file.startsWith("data:")) {
    const match = body.file.match(/^data:([^;]+);base64,(.+)$/);
    if (match) {
      mediaType = match[1];
      base64Data = match[2];
    }
  } else {
    const ext = body.fileName.split(".").pop()?.toLowerCase();
    if (ext === "pdf") mediaType = "application/pdf";
    else if (ext === "png") mediaType = "image/png";
    else if (ext === "jpg" || ext === "jpeg") mediaType = "image/jpeg";
  }

  try {
    const isPdf = mediaType === "application/pdf";
    const filePart = isPdf
      ? {
          type: "file" as const,
          data: base64Data,
          mediaType: "application/pdf" as const,
        }
      : { type: "image" as const, image: base64Data };

    console.log(
      `[extract] Starting: ${body.fileName} (${mediaType}, ${Math.round(base64Data.length / 1024)}KB)`,
    );
    const startTime = Date.now();

    const { output: aiOutput } = await generateText({
      model: anthropic("claude-haiku-4-5-20251001"),
      temperature: 0,
      maxOutputTokens: 16384,
      output: Output.object({ schema: extractionSchema }),
      messages: [
        {
          role: "user",
          content: [{ type: "text", text: PROMPT }, filePart],
        },
      ],
    });

    if (!aiOutput?.results) {
      return error("Could not extract results from this file.", 400);
    }

    console.log(`[extract] AI returned ${aiOutput.results.length} raw results`);

    const accepted: ValidatedResult[] = [];
    const unknown: Array<{ id: string; value: number | string; date?: string; suggestions?: string[] }> = [];
    const seen = new Set<string>();
    const errors: string[] = [];

    for (const { biomarker_id, value: rawValue, date } of aiOutput.results) {
      if (!VALID_IDS.has(biomarker_id)) {
        const suffix = biomarker_id.replace(/^[A-Z]-/, "");
        const suggestions = [...VALID_IDS]
          .filter((id) => id.includes(suffix) || suffix.includes(id.replace(/^[A-Z]-/, "")))
          .slice(0, 5);
        unknown.push({ id: biomarker_id, value: rawValue, date, suggestions });
        errors.push(`${biomarker_id}: unknown ID`);
        continue;
      }

      const def = getBiomarkerById(biomarker_id);
      const ref = BIOMARKER_REF[biomarker_id];

      let parsedValue: number | string;
      if (def?.type === "qualitative") {
        parsedValue = String(rawValue);
      } else {
        const num = Number(rawValue);
        if (isNaN(num) || String(rawValue).trim() === "") {
          errors.push(`${biomarker_id}: "${rawValue}" is not a number`);
          continue;
        }
        parsedValue = num;
      }

      const normalizedDate =
        normalizeDate(date) || new Date().toISOString().split("T")[0];

      const key = `${biomarker_id}:${normalizedDate}`;
      if (seen.has(key)) {
        errors.push(`${biomarker_id}: duplicate on ${normalizedDate}`);
        continue;
      }
      seen.add(key);

      let finalValue = parsedValue;
      let suspicious = false;

      if (
        typeof parsedValue === "number" &&
        isOutOfExpectedRange(parsedValue, ref?.refMin, ref?.refMax)
      ) {
        const { value: converted, converted: didConvert } = tryAutoConvert(
          parsedValue,
          biomarker_id,
        );
        if (didConvert) {
          finalValue = converted;
          console.log(
            `[extract] Auto-converted ${biomarker_id}: ${parsedValue} → ${converted} (${ref?.conventionalUnit} → ${ref?.unit})`,
          );
        } else {
          suspicious = true;
        }
      }

      accepted.push({
        biomarkerId: biomarker_id,
        categoryId: ref?.category ?? "",
        date: normalizedDate,
        value: finalValue,
        unit: ref?.unit ?? "",
        suspicious,
      });
    }

    const elapsed = Date.now() - startTime;
    console.log(
      `[extract] Done in ${elapsed}ms: ${accepted.length} accepted, ${errors.length} rejected, ${unknown.length} unknown`,
    );
    if (errors.length > 0) {
      console.log(`[extract] Errors: ${errors.slice(0, 10).join(", ")}`);
    }

    if (accepted.length === 0) {
      return error(
        "Could not extract any valid results from this file. Try a clearer image or PDF.",
        400,
      );
    }

    const categoryMap = new Map<
      string,
      Map<string, { date: string; value: number | string }[]>
    >();
    for (const r of accepted) {
      if (!categoryMap.has(r.categoryId))
        categoryMap.set(r.categoryId, new Map());
      const bioMap = categoryMap.get(r.categoryId)!;
      if (!bioMap.has(r.biomarkerId)) bioMap.set(r.biomarkerId, []);
      bioMap.get(r.biomarkerId)!.push({ date: r.date, value: r.value });
    }

    const categories = Array.from(categoryMap.entries()).map(
      ([catId, bioMap]) => ({
        id: catId,
        biomarkers: Array.from(bioMap.entries()).map(([bioId, results]) => ({
          id: bioId,
          results,
        })),
      }),
    );

    const units: Record<string, string> = {};
    const suspicious: Record<string, boolean> = {};
    for (const r of accepted) {
      if (r.unit) units[r.biomarkerId] = r.unit;
      if (r.suspicious) suspicious[`${r.biomarkerId}:${r.date}`] = true;
    }

    const unknownDeduped = [...new Map(unknown.map((u) => [u.id, u])).values()];

    await incrementExtractCount(auth.userId);

    const bioCategoryMap: Record<string, string> = {};
    for (const [id, ref] of Object.entries(BIOMARKER_REF)) {
      bioCategoryMap[id] = ref.category;
    }

    return json({
      data: { user: { name: "Extracted" }, categories },
      resultCount: accepted.length,
      units,
      suspicious,
      unknown: unknownDeduped,
      categoryMap: bioCategoryMap,
    });
  } catch (err: unknown) {
    console.error("Extraction error:", err);
    return error(
      "Failed to extract lab results. Try a clearer image or PDF.",
      500,
    );
  }
}
