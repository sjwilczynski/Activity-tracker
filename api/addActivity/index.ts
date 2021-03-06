import { AzureFunction, Context, HttpRequest } from "@azure/functions";
import { getUserId } from "../authorization";
import { database } from "../database";
import { ActivityRecord } from "../utils/types";
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
    context.res = { status: 401, body: err.message };
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
        body: err.message,
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
  activityRecords
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

const isActivityValid = (activity): activity is ActivityRecord => {
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
