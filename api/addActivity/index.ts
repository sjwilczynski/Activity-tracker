import type { AzureFunction, Context, HttpRequest } from "@azure/functions";
import { getUserId } from "../authorization";
import { database } from "../database";
import type { ActivityRecord } from "../utils/types";
import { isMatch } from "date-fns";

const httpTrigger: AzureFunction = async function (
  context: Context,
  req: HttpRequest
): Promise<void> {
  const activities = req.body;
  const idToken = req.headers["x-auth-token"];
  let userId: string;
  try {
    userId = await getUserId(idToken);
  } catch (err) {
    context.res = { status: 401, body: (err as Error).message };
    return;
  }

  if (areActivitiesValid(activities)) {
    try {
      await database.addActivities(userId, activities);
      context.res = {
        body: "Successfully added",
      };
    } catch (err) {
      context.res = {
        status: 500,
        body: (err as Error).message,
      };
    }
  } else {
    context.res = {
      status: 500,
      body: "Activity is invalid",
    };
  }
};

const areActivitiesValid = (
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  activityRecords: any
): activityRecords is ActivityRecord[] => {
  if (
    activityRecords === null ||
    activityRecords === undefined ||
    activityRecords.length === undefined ||
    activityRecords.length === 0
  ) {
    return false;
  }
  return activityRecords.every(isActivityValid);
};

const isActivityValid = (activity: unknown): activity is ActivityRecord => {
  const castedActivity = activity as ActivityRecord;
  if (castedActivity == null || castedActivity === undefined) {
    return false;
  }

  if (!isMatch(castedActivity.date, "yyyy-MM-dd")) {
    return false;
  }

  const { name, active } = castedActivity;
  if (
    typeof name !== "string" ||
    !isValidName(name) ||
    typeof active !== "boolean"
  ) {
    return false;
  }

  return true;
};

const isValidName = (name: string): boolean => {
  return Boolean(name);
};

export default httpTrigger;
