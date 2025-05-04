import { app, type HttpRequest, type HttpResponseInit } from "@azure/functions";
import { getUserId } from "../../authorization/firebaseAuthorization";
import { firebaseDB as database } from "../../database/firebaseDB";

async function deleteActivities(
  request: HttpRequest
): Promise<HttpResponseInit> {
  const idToken = request.headers.get("x-auth-token");
  let userId: string;
  try {
    userId = await getUserId(idToken);
  } catch (err) {
    return { status: 401, body: (err as Error).message };
  }

  try {
    await database.deleteAllActivities(userId);
    return {
      status: 204,
    };
  } catch {
    return {
      status: 500,
      body: "Error when trying to delete the activities",
    };
  }
}

app.http("deleteActivities", {
  methods: ["DELETE"],
  authLevel: "anonymous",
  route: "activities",
  handler: deleteActivities,
});
