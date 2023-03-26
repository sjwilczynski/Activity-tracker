import type { AzureFunction, Context, HttpRequest } from "@azure/functions";
import { getUserId } from "../authorization";
import { database } from "../database";
import type { ActivityRecord } from "../utils/types";

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

  const activity: ActivityRecord = req.body;
  const id = req.url.split("/").pop() ?? "NON_EXISTENT";

  try {
    await database.editActivity(userId, id, activity);
    context.res = { status: 204 };
  } catch (err) {
    context.res = { status: 404, body: (err as Error).message };
  }
};

export default httpTrigger;
