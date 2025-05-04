import { app, type HttpRequest, type HttpResponseInit } from "@azure/functions";
import { getUserId } from "../../authorization/firebaseAuthorization";
import { firebaseDB as database } from "../../database/firebaseDB";

async function deleteCategories(
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
    await database.deleteAllCategories(userId);
    return {
      status: 204,
    };
  } catch {
    return {
      status: 500,
      body: "Error when trying to delete categories",
    };
  }
}

app.http("deleteCategories", {
  methods: ["DELETE"],
  authLevel: "anonymous",
  route: "categories",
  handler: deleteCategories,
});
