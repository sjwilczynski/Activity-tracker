import { AzureFunction, Context, HttpRequest } from "@azure/functions";
import { getActivities } from "../utils/dbUtils";

const httpTrigger: AzureFunction = async function (
  context: Context,
  _req: HttpRequest
): Promise<void> {
  const activities = await getActivities();

  context.res = {
    // status: 200, /* Defaults to 200 */
    body: activities,
  };
};

export default httpTrigger;
