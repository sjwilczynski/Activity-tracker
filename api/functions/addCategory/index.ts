import { app, type HttpRequest, type HttpResponseInit } from "@azure/functions";
import { getUserId } from "../../authorization/firebaseAuthorization";
import { firebaseDB as database } from "../../database/firebaseDB";
import {
  checkRateLimit,
  getRateLimitHeaders,
} from "../../rateLimit/rateLimiter";
import { LIMITS } from "../../validation/constants";
import { validateCategory } from "../../validation/validators";

async function addCategory(request: HttpRequest): Promise<HttpResponseInit> {
  let category: unknown;
  try {
    category = await request.json();
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

  const validation = validateCategory(category);
  if (!validation.valid) {
    return { status: 400, body: validation.error };
  }

  try {
    const currentCount = await database.getCategoryCount(userId);
    if (currentCount >= LIMITS.MAX_CATEGORIES_PER_USER) {
      return {
        status: 400,
        body: `Category limit exceeded. Maximum ${LIMITS.MAX_CATEGORIES_PER_USER} categories per user.`,
      };
    }

    await database.addCategory(userId, validation.data!);
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

app.http("addCategory", {
  methods: ["POST"],
  authLevel: "anonymous",
  route: "categories",
  handler: addCategory,
});
