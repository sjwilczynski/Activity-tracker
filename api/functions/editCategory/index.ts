import { app, type HttpRequest, type HttpResponseInit } from "@azure/functions";
import { getUserId } from "../../authorization/firebaseAuthorization";
import { firebaseDB as database } from "../../database/firebaseDB";
import {
  checkRateLimit,
  getRateLimitHeaders,
} from "../../rateLimit/rateLimiter";
import { validateCategory } from "../../validation/validators";

async function editCategory(request: HttpRequest): Promise<HttpResponseInit> {
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

  let category: unknown;
  try {
    category = await request.json();
  } catch {
    return { status: 400, body: "Invalid JSON body" };
  }

  const categoryId = request.params.categoryId;
  if (!categoryId) {
    return { status: 400, body: "Missing categoryId route parameter." };
  }

  const validation = validateCategory(category);
  if (!validation.valid) {
    return { status: 400, body: validation.error };
  }

  try {
    await database.editCategory(userId, categoryId, validation.data!);
    return { status: 204 };
  } catch (err) {
    return { status: 404, body: (err as Error).message };
  }
}

app.http("editCategory", {
  methods: ["PUT"],
  authLevel: "anonymous",
  route: "categories/{categoryId}",
  handler: editCategory,
});
