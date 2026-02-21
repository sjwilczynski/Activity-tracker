import { app, type HttpRequest, type HttpResponseInit } from "@azure/functions";
import { getUserId } from "../../authorization/firebaseAuthorization";
import { firebaseDB as database } from "../../database/firebaseDB";
import {
  checkRateLimit,
  getRateLimitHeaders,
} from "../../rateLimit/rateLimiter";
import { DEFAULT_PREFERENCES } from "../../utils/types";
import type { ActivityMap, CategoryMap, UserPreferences } from "../../utils/types";
import { validateImportData } from "../../validation/validators";

async function importData(request: HttpRequest): Promise<HttpResponseInit> {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return { status: 400, body: "Invalid JSON body" };
  }

  const idToken = request.headers.get("x-auth-token");
  let userId: string;
  try {
    userId = await getUserId(idToken);
  } catch (err) {
    return { status: 401, body: (err as Error).message };
  }

  const rateLimitResult = await checkRateLimit(userId);
  if (!rateLimitResult.allowed) {
    return {
      status: 429,
      headers: getRateLimitHeaders(rateLimitResult),
      body: "Too many requests. Please try again later.",
    };
  }

  const validation = validateImportData(body);
  if (!validation.valid) {
    return { status: 400, body: validation.error };
  }

  const casted = body as {
    activities: ActivityMap;
    categories: CategoryMap;
    preferences?: UserPreferences;
  };

  try {
    await database.setUserData(userId, {
      activities: casted.activities,
      categories: casted.categories,
      preferences: casted.preferences ?? DEFAULT_PREFERENCES,
    });
    return { status: 200, body: "Successfully imported" };
  } catch (err) {
    return { status: 500, body: (err as Error).message };
  }
}

app.http("importData", {
  methods: ["POST"],
  authLevel: "anonymous",
  route: "import",
  handler: importData,
});
