import { AzureFunction, Context, HttpRequest } from "@azure/functions";
import { getUserId } from "../authorization";
import { database } from "../database";

const httpTrigger: AzureFunction = async function (
  context: Context,
  req: HttpRequest
): Promise<void> {
  const idToken = req.headers["authorization"];
  let userId: string;
  try {
    userId = await getUserId(idToken);
  } catch (err) {
    context.res = { status: 401, body: err.message };
    return;
  }

  const activities = await database.getActivities(userId);

  context.res = {
    // status: 200, /* Defaults to 200 */
    body: activities,
  };
};

export default httpTrigger;
