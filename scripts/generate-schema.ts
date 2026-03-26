import { readFileSync, readdirSync, statSync, writeFileSync } from "node:fs";
import { resolve, join } from "node:path";

const ROOT = resolve(import.meta.dir, "..");
const BIO_DIR = join(ROOT, "data", "biomarkers");
const OUT = join(ROOT, "data", "schema.json");

const schema = JSON.parse(readFileSync(OUT, "utf-8"));
const catProps = schema.properties.categories.items.properties;
const defRef = catProps.biomarkers.items.$ref.replace("#/$defs/", "");
const bioIdField = schema.$defs[defRef].properties.id;

const newMeta: Record<string, Record<string, unknown>> = {};
const newCatMapping: Record<string, string[]> = {};

for (const catDir of readdirSync(BIO_DIR).sort()) {
  const catPath = join(BIO_DIR, catDir);
  if (!statSync(catPath).isDirectory()) continue;

  const catBios: string[] = [];
  for (const file of readdirSync(catPath).sort()) {
    if (!file.endsWith(".json")) continue;
    const bio = JSON.parse(readFileSync(join(catPath, file), "utf-8"));
    const bid = bio.id as string;
    catBios.push(bid);

    const entry: Record<string, unknown> = { name: bio.name?.en ?? bid };
    if (bio.description?.en) entry.description = bio.description.en;
    if (bio.unit) entry.unit = bio.unit;
    if (bio.conventionalUnit) entry.conventionalUnit = bio.conventionalUnit;
    if (bio.molecularWeight) entry.molecularWeight = bio.molecularWeight;
    if (bio.refRanges?.male?.min != null) entry.refMinM = bio.refRanges.male.min;
    if (bio.refRanges?.male?.max != null) entry.refMaxM = bio.refRanges.male.max;
    if (bio.refRanges?.female?.min != null) entry.refMinF = bio.refRanges.female.min;
    if (bio.refRanges?.female?.max != null) entry.refMaxF = bio.refRanges.female.max;

    newMeta[bid] = entry;
  }

  if (catBios.length > 0) newCatMapping[catDir] = catBios;
}

bioIdField["x-biomarker-metadata"] = newMeta;
bioIdField["x-category-mapping"] = newCatMapping;
bioIdField.oneOf = Object.values(newCatMapping).map((ids) => ({ enum: ids }));

writeFileSync(OUT, JSON.stringify(schema, null, 2) + "\n");

const translations: Record<string, { name: Record<string, string>; description?: Record<string, string> }> = {};
for (const catDir of readdirSync(BIO_DIR).sort()) {
  const catPath = join(BIO_DIR, catDir);
  if (!statSync(catPath).isDirectory()) continue;
  for (const file of readdirSync(catPath).sort()) {
    if (!file.endsWith(".json")) continue;
    const bio = JSON.parse(readFileSync(join(catPath, file), "utf-8"));
    const entry: any = { name: bio.name ?? {} };
    if (bio.description) entry.description = bio.description;
    translations[bio.id] = entry;
  }
}
const TRANS_OUT = join(ROOT, "data", "biomarker-translations.json");
writeFileSync(TRANS_OUT, JSON.stringify(translations, null, 2) + "\n");

console.log(
  `Updated schema.json: ${Object.keys(newMeta).length} biomarkers, ${Object.keys(newCatMapping).length} categories`,
);
console.log(
  `Updated biomarker-translations.json: ${Object.keys(translations).length} entries`,
);
