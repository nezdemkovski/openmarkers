import { syncBiomarkers } from "./index";

const { inserted, updated, unchanged, orphans } = await syncBiomarkers();

console.log(
  `Synced: ${inserted} inserted, ${updated} updated, ${unchanged} unchanged`,
);
if (orphans.length > 0) {
  console.log(
    `Warning: ${orphans.length} biomarkers in DB but not in JSON files:`,
  );
  for (const id of orphans) console.log(`  ? ${id}`);
}

process.exit(0);
