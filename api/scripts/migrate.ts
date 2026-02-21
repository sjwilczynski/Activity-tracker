/**
 * One-off migration script — runs against the live Firebase RTDB.
 *
 * Changes per user:
 * 1. Categories: array with nulls → push-key map
 *    - subcategories[].name → activityNames: string[]
 *    - categories without subcategories get activityNames: [category.name]
 *    - removes old numeric `id` field
 * 2. Activities: adds categoryId (matched by name), removes `active` field
 *
 * Usage:
 *   cd api && node --experimental-strip-types scripts/migrate.ts
 *
 * Reads config from local.settings.json and firebase/firebaseConfig.json.
 * Uses full admin access (no databaseAuthVariableOverride) to read/write all users.
 */

import { cert, initializeApp, type ServiceAccount } from "firebase-admin/app";
import { getDatabase } from "firebase-admin/database";
import { readFileSync } from "fs";
import { migrateUserData } from "./migration-logic.ts";

// Load settings
const settings = JSON.parse(
  readFileSync(new URL("../local.settings.json", import.meta.url), "utf-8")
);
const firebaseConfig = JSON.parse(
  readFileSync(
    new URL("../firebase/firebaseConfig.json", import.meta.url),
    "utf-8"
  )
);

// Initialize with full admin access (no databaseAuthVariableOverride)
const serviceAccount: ServiceAccount = {
  clientEmail: firebaseConfig.client_email,
  privateKey: firebaseConfig.private_key,
  projectId: firebaseConfig.project_id,
};

initializeApp({
  credential: cert(serviceAccount),
  databaseURL: settings.Values.databaseURL,
});

const db = getDatabase();
const usersSnapshot = await db.ref("users").once("value");
const users = usersSnapshot.val();

if (!users) {
  console.log("No users found");
  process.exit(0);
}

const userIds = Object.keys(users);
console.log(`Found ${userIds.length} user(s) to migrate\n`);

let totalActivities = 0;
let totalCategories = 0;
const failedUserIds: string[] = [];

for (const userId of userIds) {
  console.log(`Migrating user: ${userId}`);
  const userRef = db.ref(`users/${userId}`);
  const snapshot = await userRef.once("value");
  const userData = snapshot.val();

  if (!userData) {
    console.log("  No data, skipping");
    continue;
  }

  // Use Firebase push keys
  const generateKey = () => userRef.child("categories").push().key!;

  try {
    const result = migrateUserData(userData, generateKey);

    // Build a single atomic update: null old array indices + write new map entries
    const updates: Record<string, unknown> = {};
    if (Array.isArray(userData.categories)) {
      for (let i = 0; i < userData.categories.length; i++) {
        updates[`categories/${i}`] = null;
      }
    }
    for (const [key, cat] of Object.entries(result.categories)) {
      updates[`categories/${key}`] = cat;
    }
    for (const [key, act] of Object.entries(result.activities)) {
      updates[`activity/${key}`] = act;
    }

    if (Object.keys(updates).length > 0) {
      await userRef.update(updates);
    }

    totalActivities += result.stats.activitiesMigrated;
    totalCategories += result.stats.categoriesMigrated;

    console.log(
      `  Categories: ${result.stats.categoriesMigrated}, Activities: ${result.stats.activitiesMigrated}`
    );
    if (result.stats.unmatchedActivityNames.length > 0) {
      console.log(
        `  ⚠ Unmatched: ${result.stats.unmatchedActivityNames.join(", ")}`
      );
    }
  } catch (error) {
    console.error(`  ✗ Failed to migrate user ${userId}:`, error);
    failedUserIds.push(userId);
  }
}

console.log(
  `\nMigration complete. Total: ${totalCategories} categories, ${totalActivities} activities`
);
if (failedUserIds.length > 0) {
  console.error(
    `\n⚠ Failed users (${failedUserIds.length}): ${failedUserIds.join(", ")}`
  );
}
process.exit(0);
