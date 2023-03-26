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

  const limit = req.query.limit ? parseInt(req.query.limit) : undefined;

  const activityMap = (await database.getActivities(userId, limit)) ?? {};
  const activities = mapToList(activityMap);

  context.res = {
    // status: 200, /* Defaults to 200 */
    body: activities,
  };
};

export default httpTrigger;
