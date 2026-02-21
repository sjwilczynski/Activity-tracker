import { app, type HttpRequest, type HttpResponseInit } from "@azure/functions";
import { getUserId } from "../../authorization/firebaseAuthorization";
import { firebaseDB as database } from "../../database/firebaseDB";
import {
  checkRateLimit,
  getRateLimitHeaders,
} from "../../rateLimit/rateLimiter";
import { DEFAULT_PREFERENCES } from "../../utils/types";
import { LIMITS } from "../../validation/constants";
import { validateImportData } from "../../validation/validators";

async function importData(request: HttpRequest): Promise<HttpResponseInit> {
  const idToken = request.headers.get("x-auth-token");
  let userId: string;
  try {
    userId = await getUserId(idToken);
  } catch {
    return { status: 401, body: "Unauthorized" };
  }

  const rateLimitResult = await checkRateLimit(userId);
  if (!rateLimitResult.allowed) {
    return {
      status: 429,
      headers: getRateLimitHeaders(rateLimitResult),
      body: "Too many requests. Please try again later.",
    };
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return { status: 400, body: "Invalid JSON body" };
  }

  const validation = validateImportData(body);
  if (!validation.valid) {
    return { status: 400, body: validation.error };
  }

  const { activities, categories, preferences } = validation.data;

  const activityCount = Object.keys(activities).length;
  const categoryCount = Object.keys(categories).length;
  if (activityCount > LIMITS.MAX_ACTIVITIES_PER_USER) {
    return {
      status: 400,
      body: `Too many activities: ${activityCount} exceeds limit of ${LIMITS.MAX_ACTIVITIES_PER_USER}`,
    };
  }
  if (categoryCount > LIMITS.MAX_CATEGORIES_PER_USER) {
    return {
      status: 400,
      body: `Too many categories: ${categoryCount} exceeds limit of ${LIMITS.MAX_CATEGORIES_PER_USER}`,
    };
  }

  try {
    await database.setUserData(userId, {
      activities,
      categories,
      preferences: preferences ?? DEFAULT_PREFERENCES,
    });
    return { status: 200, body: "Successfully imported" };
  } catch (err) {
    console.error("importData error:", err);
    return { status: 500, body: "Internal server error" };
  }
}

app.http("importData", {
  methods: ["POST"],
  authLevel: "anonymous",
  route: "import",
  handler: importData,
});
