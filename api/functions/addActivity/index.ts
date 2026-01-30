import { app, type HttpRequest, type HttpResponseInit } from "@azure/functions";
import { getUserId } from "../../authorization/firebaseAuthorization";
import { firebaseDB as database } from "../../database/firebaseDB";
import {
  checkRateLimit,
  getRateLimitHeaders,
} from "../../rateLimit/rateLimiter";
import { LIMITS } from "../../validation/constants";
import { validateActivityBatch } from "../../validation/validators";

async function addActivity(request: HttpRequest): Promise<HttpResponseInit> {
  let activities: unknown;
  try {
    activities = await request.json();
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

  const validation = validateActivityBatch(activities);
  if (!validation.valid) {
    return { status: 400, body: validation.error };
  }

  const validatedActivities = validation.data!;

  try {
    const currentCount = await database.getActivityCount(userId);
    if (
      currentCount + validatedActivities.length >
      LIMITS.MAX_ACTIVITIES_PER_USER
    ) {
      return {
        status: 400,
        body: `Activity limit exceeded. Maximum ${LIMITS.MAX_ACTIVITIES_PER_USER} activities per user.`,
      };
    }

    await database.addActivities(userId, validatedActivities);
    return {
      status: 200,
      body: "Successfully added",
    };
  } catch (err) {
    return {
      status: 500,
      body: (err as Error).message,
    };
  }
}

app.http("addActivity", {
  methods: ["POST"],
  authLevel: "anonymous",
  route: "activities",
  handler: addActivity,
});
