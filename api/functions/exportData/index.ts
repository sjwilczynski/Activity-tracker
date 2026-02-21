import { app, type HttpRequest, type HttpResponseInit } from "@azure/functions";
import { getUserId } from "../../authorization/firebaseAuthorization";
import { firebaseDB as database } from "../../database/firebaseDB";

async function exportData(request: HttpRequest): Promise<HttpResponseInit> {
  const idToken = request.headers.get("x-auth-token");
  let userId: string;
  try {
    userId = await getUserId(idToken);
  } catch (err) {
    return { status: 401, body: (err as Error).message };
  }

  try {
    const userData = await database.getUserData(userId);
    return { status: 200, jsonBody: userData };
  } catch (err) {
    return { status: 500, body: (err as Error).message };
  }
}

app.http("exportData", {
  methods: ["GET"],
  authLevel: "anonymous",
  route: "export",
  handler: exportData,
});
