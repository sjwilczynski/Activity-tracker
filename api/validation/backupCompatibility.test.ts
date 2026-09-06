import { describe, expect, it } from "vitest";
import { assignActivityName } from "../../shared/activity-names";
import { validateImportData } from "../../shared/backup";
import { validateCategory } from "../../shared/record-validation";
import { offlineSnapshot } from "../test-support/offlineSnapshot";

const activity = { name: "Running", date: "2024-01-01", timeSpent: 0 };
const category = {
  name: "Sports",
  description: "",
  active: true,
  activityNames: ["Running"],
};

describe("restoring legacy Firebase representations", () => {
  it.each([["0", "1"], ["0", "2"], ["1"]])(
    "normalizes old serialized activity/category arrays with IDs %j",
    async (...ids) => {
      const backup = {
        activities: Object.fromEntries(ids.map((id) => [id, activity])),
        categories: { "1": category },
      };
      const snapshot = await offlineSnapshot(backup);
      const legacy: unknown = JSON.parse(JSON.stringify(snapshot.val()));
      expect(validateImportData(legacy)).toEqual({ valid: true, data: backup });
    }
  );

  it("still rejects malformed populated array entries and null object records", () => {
    for (const activities of [[null, "wrong"], [0], { bad: null }]) {
      expect(validateImportData({ activities, categories: {} }).valid).toBe(
        false
      );
    }
    for (const categories of [[null, false], [0], { bad: null }]) {
      expect(validateImportData({ activities: {}, categories }).valid).toBe(
        false
      );
    }
  });
});

describe("exact activity-name membership", () => {
  it.each([" Running ", "running"])(
    "preserves distinct identity %j after reassignment and restore",
    async (name) => {
      const original = {
        activities: { first: activity, second: { ...activity, name } },
        categories: {
          sports: category,
          other: { ...category, name: "Other", activityNames: [name] },
        },
      };
      expect(validateImportData(original).valid).toBe(true);
      const categories = assignActivityName(
        original.categories,
        name,
        "sports"
      );
      const backup = { ...original, categories };
      expect(categories.sports.activityNames).toEqual(["Running", name]);
      const restored = validateImportData(
        (await offlineSnapshot(backup)).val()
      );
      expect(restored).toEqual({ valid: true, data: backup });
      expect(
        validateCategory(
          { ...categories.sports, name: "New title" },
          { preserveActivityNameIdentities: true }
        )
      ).toEqual({
        valid: true,
        data: { ...categories.sports, name: "New title" },
      });
    }
  );

  it("retains stricter duplicate detection for newly created categories", () => {
    expect(
      validateCategory({
        ...category,
        activityNames: ["Running", " Running "],
      }).valid
    ).toBe(false);
  });
});
