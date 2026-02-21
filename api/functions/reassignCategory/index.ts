import { app, type HttpRequest, type HttpResponseInit } from "@azure/functions";
import { getUserId } from "../../authorization/firebaseAuthorization";
import { firebaseDB as database } from "../../database/firebaseDB";
import {
  checkRateLimit,
  getRateLimitHeaders,
} from "../../rateLimit/rateLimiter";
import { validateReassignCategoryBody } from "../../validation/validators";

async function reassignCategory(
  request: HttpRequest
): Promise<HttpResponseInit> {
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

  const validation = validateReassignCategoryBody(body);
  if (!validation.valid) {
    return { status: 400, body: validation.error };
  }

  try {
    const count = await database.bulkReassignCategory(
      userId,
      validation.data!.fromCategoryId,
      validation.data!.toCategoryId
    );
    return { status: 200, jsonBody: { updated: count } };
  } catch (err) {
    return { status: 500, body: (err as Error).message };
  }
}

app.http("reassignCategory", {
  methods: ["POST"],
  authLevel: "anonymous",
  route: "activities/reassign-category",
  handler: reassignCategory,
});
