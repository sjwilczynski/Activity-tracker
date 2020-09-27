import { AzureFunction, Context, HttpRequest } from "@azure/functions";
import { getUserId } from "../authorization";
import { database } from "../database";
import { ActivityMap, ActivityRecordWithId } from "../utils/types";

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

  const activityMap = await database.getActivities(userId);
  const activities = mapToList(activityMap);

  context.res = {
    // status: 200, /* Defaults to 200 */
    body: activities,
  };
};

const mapToList = (activityMap: ActivityMap): ActivityRecordWithId[] => {
  return Object.entries(activityMap).map(([key, activityRecord]) => {
    return { id: key, ...activityRecord };
  });
};

export default httpTrigger;
