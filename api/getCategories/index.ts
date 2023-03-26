import type { AzureFunction, Context, HttpRequest } from "@azure/functions";
import { getUserId } from "../authorization";
import { database } from "../database";
import { mapToList } from "../utils/mapToList";

const httpTrigger: AzureFunction = async function (
  context: Context,
  req: HttpRequest
): Promise<void> {
  const idToken = req.headers["x-auth-token"];
  let userId: string;
  try {
    userId = await getUserId(idToken);
  } catch (err) {
    context.res = { status: 401, body: (err as Error).message };
    return;
  }

  const categoriesMap = (await database.getCategories(userId)) ?? {};
  const categories = mapToList(categoriesMap);

  context.res = {
    // status: 200, /* Defaults to 200 */
    body: categories,
  };
};

export default httpTrigger;
