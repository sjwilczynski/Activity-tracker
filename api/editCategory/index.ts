import { app, type HttpRequest, type HttpResponseInit } from "@azure/functions";
import { getUserId } from "../authorization/firebaseAuthorization";
import { firebaseDB as database } from "../database/firebaseDB";
import type { Category } from "../utils/types";

async function editCategory(request: HttpRequest): Promise<HttpResponseInit> {
  const idToken = request.headers.get("x-auth-token");
  let userId: string;
  try {
    userId = await getUserId(idToken);
  } catch (err) {
    return { status: 401, body: (err as Error).message };
  }

  const category = (await request.json()) as Category;
  const categoryId = request.params.categoryId;

  if (!categoryId) {
    return { status: 400, body: "Missing categoryId route parameter." };
  }

  try {
    await database.editCategory(userId, categoryId, category);
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
