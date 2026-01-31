import { app, type HttpRequest, type HttpResponseInit } from "@azure/functions";
import { getUserId } from "../../authorization/firebaseAuthorization";
import { firebaseDB as database } from "../../database/firebaseDB";
import {
  checkRateLimit,
  getRateLimitHeaders,
} from "../../rateLimit/rateLimiter";
import { validateActivityRecord } from "../../validation/validators";

async function editActivity(request: HttpRequest): Promise<HttpResponseInit> {
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

  let activity: unknown;
  try {
    activity = await request.json();
  } catch {
    return { status: 400, body: "Invalid JSON body" };
  }

  const activityId = request.params.activityId;
  if (!activityId) {
    return { status: 400, body: "Missing activityId route parameter." };
  }

  const validation = validateActivityRecord(activity);
  if (!validation.valid) {
    return { status: 400, body: validation.error };
  }

  try {
    await database.editActivity(userId, activityId, validation.data!);
    return { status: 204 };
  } catch (err) {
    return { status: 404, body: (err as Error).message };
  }
}

app.http("editActivity", {
  methods: ["PUT"],
  authLevel: "anonymous",
  route: "activities/{activityId}",
  handler: editActivity,
});
