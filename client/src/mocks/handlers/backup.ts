import { http, HttpResponse } from "msw";
import { validateImportData } from "../../../../shared/backup";
import { DEFAULT_PREFERENCES } from "../../../../shared/types";
import { validateActivityRecord } from "../../../../shared/validators";
import { getActivities, setActivities } from "./activities";
import { getCategories, setCategories } from "./categories";
import { getPreferences, setPreferences } from "./preferences";

export const backupHandlers = [
  http.get("*/api/export", ({ request }) => {
    if (!request.headers.get("x-auth-token"))
      return new HttpResponse(null, { status: 401 });
    const activities = Object.fromEntries(
      getActivities().map((activity) => {
        const result = validateActivityRecord(activity);
        if (!result.valid || !result.data)
          throw new Error("Invalid mock activity");
        return [activity.id, result.data];
      })
    );
    const categories = Object.fromEntries(
      getCategories().map(({ id, ...category }) => [id, category])
    );
    return HttpResponse.json({
      activities,
      categories,
      preferences: getPreferences(),
    });
  }),
  http.post("*/api/import", async ({ request }) => {
    if (!request.headers.get("x-auth-token"))
      return new HttpResponse(null, { status: 401 });
    const result = validateImportData(await request.json());
    if (!result.valid) return new HttpResponse(result.error, { status: 400 });
    setActivities(
      Object.entries(result.data.activities).map(([id, activity]) => ({
        ...activity,
        id,
        categoryId: "",
        active: true,
      }))
    );
    setCategories(
      Object.entries(result.data.categories).map(([id, category]) => ({
        ...category,
        id,
      }))
    );
    setPreferences(result.data.preferences ?? DEFAULT_PREFERENCES);
    return new HttpResponse("Successfully imported", { status: 200 });
  }),
];
