import { readFileSync, readdirSync, statSync } from "node:fs";
import { resolve, join } from "node:path";

export interface BiomarkerDefinition {
  id: string;
  category: string;
  type: "quantitative" | "qualitative";
  unit?: string;
  conventionalUnit?: string;
  molecularWeight?: number;
  refRanges?: {
    male?: { min?: number; max?: number };
    female?: { min?: number; max?: number };
  };
  phenoAge?: {
    coefficient: number;
    unit: string;
    label: string;
    transform?: string;
  };
  name: Record<string, string>;
  description?: Record<string, string>;
}

let _cache: {
  all: BiomarkerDefinition[];
  byId: Map<string, BiomarkerDefinition>;
  byCategory: Map<string, BiomarkerDefinition[]>;
  categoryIds: string[];
  validIds: Set<string>;
} | null = null;

function loadAll(): typeof _cache {
  if (_cache) return _cache;

  const baseDir = resolve(import.meta.dir, "../../../data/biomarkers");
  const all: BiomarkerDefinition[] = [];
  const byId = new Map<string, BiomarkerDefinition>();
  const byCategory = new Map<string, BiomarkerDefinition[]>();

  for (const catDir of readdirSync(baseDir)) {
    const catPath = join(baseDir, catDir);
    if (!statSync(catPath).isDirectory()) continue;

    for (const file of readdirSync(catPath)) {
      if (!file.endsWith(".json")) continue;
      const raw = readFileSync(join(catPath, file), "utf-8");
      const def: BiomarkerDefinition = JSON.parse(raw);
      all.push(def);
      byId.set(def.id, def);
      if (!byCategory.has(def.category)) byCategory.set(def.category, []);
      byCategory.get(def.category)!.push(def);
    }
  }

  const categoryIds = [...byCategory.keys()].sort();
  const validIds = new Set(byId.keys());

  _cache = { all, byId, byCategory, categoryIds, validIds };
  return _cache;
}

export function getAllBiomarkers(): BiomarkerDefinition[] {
  return loadAll()!.all;
}

export function getBiomarkerById(id: string): BiomarkerDefinition | undefined {
  return loadAll()!.byId.get(id);
}

export function getBiomarkersByCategory(
  categoryId: string,
): BiomarkerDefinition[] {
  return loadAll()!.byCategory.get(categoryId) ?? [];
}

export function getCategoryIds(): string[] {
  return loadAll()!.categoryIds;
}

export function getValidBiomarkerIds(): Set<string> {
  return loadAll()!.validIds;
}

export function isValidBiomarkerId(id: string): boolean {
  return loadAll()!.validIds.has(id);
}

export function isQualitative(id: string): boolean {
  return loadAll()!.byId.get(id)?.type === "qualitative";
}

export function getBiomarkerName(id: string, lang: string): string {
  const def = loadAll()!.byId.get(id);
  if (!def) return id;
  return def.name[lang] ?? def.name.en ?? id;
}

export function getBiomarkerDescription(id: string, lang: string): string {
  const def = loadAll()!.byId.get(id);
  if (!def?.description) return "";
  return def.description[lang] ?? def.description.en ?? "";
}

export function getPhenoAgeMarkers(): BiomarkerDefinition[] {
  return loadAll()!.all.filter((d) => d.phenoAge != null);
}

export function buildCompactReference(): Record<
  string,
  {
    category: string;
    unit: string;
    name: string;
    qualitative: boolean;
    refMin?: number;
    refMax?: number;
    conventionalUnit?: string;
  }
> {
  const ref: Record<string, any> = {};
  for (const def of loadAll()!.all) {
    ref[def.id] = {
      category: def.category,
      unit: def.unit ?? "",
      name: def.name.en ?? def.id,
      qualitative: def.type === "qualitative",
    };
    if (def.refRanges?.male?.min != null)
      ref[def.id].refMin = def.refRanges.male.min;
    if (def.refRanges?.male?.max != null)
      ref[def.id].refMax = def.refRanges.male.max;
    if (def.conventionalUnit)
      ref[def.id].conventionalUnit = def.conventionalUnit;
  }
  return ref;
}

export function buildMolecularWeightMap(): Record<string, number> {
  const map: Record<string, number> = {};
  for (const def of loadAll()!.all) {
    if (def.molecularWeight) map[def.id] = def.molecularWeight;
  }
  return map;
}
