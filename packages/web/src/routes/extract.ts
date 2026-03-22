import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { generateText, Output } from "ai";
import { anthropic } from "@ai-sdk/anthropic";
import { parse, format, isValid } from "date-fns";
import { z } from "zod";

import { json, error, parseBody, isResponse } from "./_shared.ts";


interface BiomarkerRef {
  category: string;
  unit: string;
  name: string;
  qualitative: boolean;
}

function loadBiomarkerReference(): {
  ref: Record<string, BiomarkerRef>;
  validIds: Set<string>;
} {
  const schemaPath = resolve(import.meta.dir, "../../../../data/schema.json");
  const schema = JSON.parse(readFileSync(schemaPath, "utf-8"));
  const catProps = schema.properties.categories.items.properties;
  const defRef = catProps.biomarkers.items.$ref.replace("#/$defs/", "");
  const bioIdField = schema.$defs[defRef].properties.id;

  const meta = bioIdField["x-biomarker-metadata"] as Record<
    string,
    Record<string, unknown>
  >;

  const catMapping = bioIdField["x-category-mapping"] as Record<
    string,
    string[]
  >;
  const bioToCategory: Record<string, string> = {};
  for (const [catId, bioIds] of Object.entries(catMapping)) {
    for (const bioId of bioIds) {
      bioToCategory[bioId] = catId;
    }
  }

  const dipstickIds = new Set(catMapping["urine_dipstick"] || []);

  const ref: Record<string, BiomarkerRef> = {};
  const validIds = new Set<string>();
  for (const [id, m] of Object.entries(meta)) {
    const category = bioToCategory[id] || "";
    if (!category) continue;
    ref[id] = {
      category,
      unit: (m.unit as string) || "",
      name: (m.name as string) || "",
      qualitative: dipstickIds.has(id) && !m.unit,
    };
    validIds.add(id);
  }
  return { ref, validIds };
}

const { ref: BIOMARKER_REF, validIds: VALID_IDS } = loadBiomarkerReference();
const BIOMARKER_REF_TEXT = JSON.stringify(BIOMARKER_REF);


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


const rateLimits = new Map<string, { count: number; resetAt: number }>();
const MAX_EXTRACTIONS_PER_DAY = 5;

function checkRateLimit(userId: string): boolean {
  const now = Date.now();
  const entry = rateLimits.get(userId);
  if (!entry || now > entry.resetAt) {
    rateLimits.set(userId, {
      count: 1,
      resetAt: now + 24 * 60 * 60 * 1000,
    });
    return true;
  }
  if (entry.count >= MAX_EXTRACTIONS_PER_DAY) return false;
  entry.count++;
  return true;
}

setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of rateLimits) {
    if (now > entry.resetAt) rateLimits.delete(key);
  }
}, 60 * 60 * 1000);


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
  if (!checkRateLimit(auth.userId)) {
    return error("Daily extraction limit reached", 429);
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
          content: [
            { type: "text", text: PROMPT },
            filePart,
          ],
        },
      ],
    });

    if (!aiOutput || !aiOutput.results) {
      return error("Could not extract results from this file.", 400);
    }

    console.log(`[extract] AI returned ${aiOutput.results.length} raw results`);

    const accepted: ValidatedResult[] = [];
    const unknown: Array<{ id: string; value: number | string }> = [];
    const seen = new Set<string>();
    const errors: string[] = [];

    for (const { biomarker_id, value: rawValue, date } of aiOutput.results) {
      if (!VALID_IDS.has(biomarker_id)) {
        unknown.push({ id: biomarker_id, value: rawValue });
        errors.push(`${biomarker_id}: unknown ID`);
        continue;
      }

      const ref = BIOMARKER_REF[biomarker_id];

      let parsedValue: number | string;
      if (ref.qualitative) {
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

      accepted.push({
        biomarkerId: biomarker_id,
        categoryId: ref.category,
        date: normalizedDate,
        value: parsedValue,
        unit: ref.unit,
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

    const data = {
      user: { name: "Extracted" },
      categories,
    };

    const units: Record<string, string> = {};
    for (const r of accepted) {
      if (r.unit) units[r.biomarkerId] = r.unit;
    }

    const unknownDeduped = [
      ...new Map(unknown.map((u) => [u.id, u])).values(),
    ];

    return json({
      data,
      resultCount: accepted.length,
      units,
      unknown: unknownDeduped,
    });
  } catch (err: unknown) {
    console.error("Extraction error:", err);
    return error(
      "Failed to extract lab results. Try a clearer image or PDF.",
      500,
    );
  }
}
