import { app, type HttpRequest, type HttpResponseInit } from "@azure/functions";
import { getUserId } from "../../authorization/firebaseAuthorization";
import { firebaseDB as database } from "../../database/firebaseDB";
import {
  checkRateLimit,
  getRateLimitHeaders,
} from "../../rateLimit/rateLimiter";

async function exportData(request: HttpRequest): Promise<HttpResponseInit> {
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

  try {
    const userData = await database.getUserData(userId);
    return { status: 200, jsonBody: userData };
  } catch (err) {
    console.error("exportData error:", err);
    return { status: 500, body: "Internal server error" };
  }
}

app.http("exportData", {
  methods: ["GET"],
  authLevel: "anonymous",
  route: "export",
  handler: exportData,
});
