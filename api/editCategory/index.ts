import { AzureFunction, Context, HttpRequest } from "@azure/functions";
import { getUserId } from "../authorization";
import { database } from "../database";
import { Category } from "../utils/types";

const httpTrigger: AzureFunction = async function (
  context: Context,
  req: HttpRequest
): Promise<void> {
  const idToken = req.headers["x-auth-token"];
  let userId: string;
  try {
    userId = await getUserId(idToken);
  } catch (err) {
    context.res = { status: 401, body: err.message };
    return;
  }

  const category = req.body as Category;
  const id = req.url.split("/").pop() ?? "NON_EXISTENT";

  try {
    await database.editCategory(userId, id, category);
    context.res = { status: 204 };
  } catch (err) {
    context.res = { status: 404, body: err.message };
  }
};

export default httpTrigger;