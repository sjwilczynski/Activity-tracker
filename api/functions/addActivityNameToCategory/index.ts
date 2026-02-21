import { app, type HttpRequest, type HttpResponseInit } from "@azure/functions";
import { getUserId } from "../../authorization/firebaseAuthorization";
import { firebaseDB as database } from "../../database/firebaseDB";
import {
  checkRateLimit,
  getRateLimitHeaders,
} from "../../rateLimit/rateLimiter";
import {
  validateAddActivityNameBody,
  validateCategoryId,
} from "../../validation/validators";

async function addActivityNameToCategory(
  request: HttpRequest
): Promise<HttpResponseInit> {
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

  const categoryId = request.params.categoryId;
  const categoryIdValidation = validateCategoryId(categoryId);
  if (!categoryIdValidation.valid) {
    return { status: 400, body: categoryIdValidation.error };
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return { status: 400, body: "Invalid JSON body" };
  }

  const validation = validateAddActivityNameBody(body);
  if (!validation.valid) {
    return { status: 400, body: validation.error };
  }

  try {
    await database.addActivityNameToCategory(
      userId,
      categoryId!,
      validation.data.activityName
    );
    return { status: 200, body: "Activity name added to category" };
  } catch (err) {
    const message = (err as Error).message;
    if (message.includes("already belongs to") || message.includes("not found")) {
      return { status: 400, body: message };
    }
    console.error("addActivityNameToCategory error:", err);
    return { status: 500, body: "Internal server error" };
  }
}

app.http("addActivityNameToCategory", {
  methods: ["POST"],
  authLevel: "anonymous",
  route: "categories/{categoryId}/activity-names",
  handler: addActivityNameToCategory,
});
