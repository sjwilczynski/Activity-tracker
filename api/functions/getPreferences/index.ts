import { app, type HttpRequest, type HttpResponseInit } from "@azure/functions";
import { getUserId } from "../../authorization/firebaseAuthorization";
import { firebaseDB as database } from "../../database/firebaseDB";

async function getPreferences(request: HttpRequest): Promise<HttpResponseInit> {
  const idToken = request.headers.get("x-auth-token");
  let userId: string;
  try {
    userId = await getUserId(idToken);
  } catch {
    return { status: 401, body: "Unauthorized" };
  }

  try {
    const preferences = await database.getPreferences(userId);
    return { status: 200, jsonBody: preferences };
  } catch (err) {
    console.error("getPreferences error:", err);
    return { status: 500, body: "Internal server error" };
  }
}

app.http("getPreferences", {
  methods: ["GET"],
  authLevel: "anonymous",
  route: "preferences",
  handler: getPreferences,
});
