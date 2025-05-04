import { app, type HttpRequest, type HttpResponseInit } from "@azure/functions";
import { getUserId } from "../authorization/firebaseAuthorization";
import { firebaseDB as database } from "../database/firebaseDB";
import type { ActivityRecord } from "../utils/types";

async function editActivity(request: HttpRequest): Promise<HttpResponseInit> {
  const idToken = request.headers.get("x-auth-token");
  let userId: string;
  try {
    userId = await getUserId(idToken);
  } catch (err) {
    return { status: 401, body: (err as Error).message };
  }

  const activity = (await request.json()) as ActivityRecord;
  const activityId = request.params.activityId;

  if (!activityId) {
    return { status: 400, body: "Missing activityId route parameter." };
  }

  try {
    await database.editActivity(userId, activityId, activity);
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
