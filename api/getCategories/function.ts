import { app, type HttpRequest, type HttpResponseInit } from "@azure/functions";
import { getUserId } from "../authorization/firebaseAuthorization";
import { firebaseDB as database } from "../database/firebaseDB";
import { mapToList } from "../utils/mapToList";

async function getCategories(request: HttpRequest): Promise<HttpResponseInit> {
  const idToken = request.headers.get("x-auth-token");
  let userId: string;
  try {
    userId = await getUserId(idToken);
  } catch (err) {
    return { status: 401, body: (err as Error).message };
  }

  const categoriesMap = (await database.getCategories(userId)) ?? {};
  const categories = mapToList(categoriesMap);

  return {
    status: 200,
    jsonBody: categories,
  };
}

app.http("getCategories", {
  methods: ["GET"],
  authLevel: "anonymous",
  route: "categories",
  handler: getCategories,
});
