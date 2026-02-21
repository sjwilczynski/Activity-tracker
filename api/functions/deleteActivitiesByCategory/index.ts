import { app, type HttpRequest, type HttpResponseInit } from "@azure/functions";
import { getUserId } from "../../authorization/firebaseAuthorization";
import { firebaseDB as database } from "../../database/firebaseDB";
import {
  checkRateLimit,
  getRateLimitHeaders,
} from "../../rateLimit/rateLimiter";
import { validateDeleteByCategoryBody } from "../../validation/validators";

async function deleteActivitiesByCategory(
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

  const validation = validateDeleteByCategoryBody(body);
  if (!validation.valid) {
    return { status: 400, body: validation.error };
  }

  try {
    const count = await database.deleteActivitiesByCategory(
      userId,
      validation.data!.categoryId
    );
    return { status: 200, jsonBody: { deleted: count } };
  } catch (err) {
    console.error("deleteActivitiesByCategory error:", err);
    return { status: 500, body: "Internal server error" };
  }
}

app.http("deleteActivitiesByCategory", {
  methods: ["POST"],
  authLevel: "anonymous",
  route: "activities/delete-by-category",
  handler: deleteActivitiesByCategory,
});
