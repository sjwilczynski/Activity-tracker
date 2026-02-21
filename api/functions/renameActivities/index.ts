import { app, type HttpRequest, type HttpResponseInit } from "@azure/functions";
import { getUserId } from "../../authorization/firebaseAuthorization";
import { firebaseDB as database } from "../../database/firebaseDB";
import {
  checkRateLimit,
  getRateLimitHeaders,
} from "../../rateLimit/rateLimiter";
import { validateRenameBody } from "../../validation/validators";

async function renameActivities(
  request: HttpRequest
): Promise<HttpResponseInit> {
  const idToken = request.headers.get("x-auth-token");
  let userId: string;
  try {
    userId = await getUserId(idToken);
  } catch {
    return { status: 401, body: "Unauthorized" };
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return { status: 400, body: "Invalid JSON body" };
  }

  const rateLimitResult = await checkRateLimit(userId);
  if (!rateLimitResult.allowed) {
    return {
      status: 429,
      headers: getRateLimitHeaders(rateLimitResult),
      body: "Too many requests. Please try again later.",
    };
  }

  const validation = validateRenameBody(body);
  if (!validation.valid) {
    return { status: 400, body: validation.error };
  }

  try {
    const count = await database.bulkRenameActivities(
      userId,
      validation.data.oldName,
      validation.data.newName
    );
    return { status: 200, jsonBody: { updated: count } };
  } catch (err) {
    console.error("renameActivities error:", err);
    return { status: 500, body: "Internal server error" };
  }
}

app.http("renameActivities", {
  methods: ["POST"],
  authLevel: "anonymous",
  route: "activities/rename",
  handler: renameActivities,
});
