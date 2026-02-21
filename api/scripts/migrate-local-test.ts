/**
 * Local test for the migration logic using an exported Firebase JSON file.
 * Does NOT connect to Firebase — reads/writes local files only.
 *
 * Usage:
 *   node --experimental-strip-types api/scripts/migrate-local-test.ts [input.json]
 */

import { randomBytes } from "crypto";
import { readFileSync, writeFileSync } from "fs";
import { migrateUserData } from "./migration-logic.ts";

function generateLocalKey(): string {
  return "-" + randomBytes(10).toString("base64url").slice(0, 19);
}

const inputPath =
  process.argv[2] || "/home/stachu/Pobrane/activity-tracker-7c548-export.json";
const outputPath = inputPath.replace(".json", "-migrated.json");

console.log(`Reading: ${inputPath}\n`);
const raw = JSON.parse(readFileSync(inputPath, "utf-8"));

for (const [userId, userData] of Object.entries(
  raw.users as Record<string, Record<string, unknown>>
)) {
  console.log(`Migrating user: ${userId}`);

  const result = migrateUserData(userData, generateLocalKey);
  raw.users[userId] = {
    ...userData,
    categories: result.categories,
    activity: result.activities,
  };

  console.log(`  Categories: ${result.stats.categoriesMigrated}`);
  console.log(`  Activities: ${result.stats.activitiesMigrated}`);
  if (result.stats.unmatchedActivityNames.length > 0) {
    console.log(
      `  Unmatched activity names: ${result.stats.unmatchedActivityNames.join(", ")}`
    );
  }

  // Print sample categories
  const catEntries = Object.entries(result.categories).slice(0, 3);
  console.log("\n  Sample migrated categories:");
  for (const [key, cat] of catEntries) {
    console.log(
      `    ${key}: ${cat.name} (${cat.active ? "active" : "inactive"}) → [${cat.activityNames.join(", ")}]`
    );
  }

  // Print sample activities
  const actEntries = Object.entries(result.activities).slice(0, 5);
  console.log("\n  Sample migrated activities:");
  for (const [key, act] of actEntries) {
    const catName = result.categories[act.categoryId]?.name || "(unmatched)";
    console.log(`    ${key}: ${act.name} ${act.date} → category: ${catName}`);
  }
}

writeFileSync(outputPath, JSON.stringify(raw, null, 2));
console.log(`\nMigrated data written to: ${outputPath}`);
