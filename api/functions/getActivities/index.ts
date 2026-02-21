import { app, type HttpRequest, type HttpResponseInit } from "@azure/functions";
import { getUserId } from "../../authorization/firebaseAuthorization";
import { firebaseDB as database } from "../../database/firebaseDB";
import { mapToList } from "../../utils/mapToList";

async function getActivities(request: HttpRequest): Promise<HttpResponseInit> {
  const idToken = request.headers.get("x-auth-token");
  let userId: string;
  try {
    userId = await getUserId(idToken);
  } catch (err) {
    return { status: 401, body: (err as Error).message };
  }

  const limitQuery = request.query.get("limit");
  const limit = limitQuery ? parseInt(limitQuery) : undefined;

  const enrichedActivityMap =
    (await database.getActivities(userId, limit)) ?? {};
  const activities = mapToList(enrichedActivityMap);

  return {
    status: 200,
    jsonBody: activities,
  };
}

app.http("getActivities", {
  methods: ["GET"],
  authLevel: "anonymous",
  route: "activities",
  handler: getActivities,
});
