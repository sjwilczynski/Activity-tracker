import { AzureFunction, Context, HttpRequest } from "@azure/functions";
import moment from "moment";
import { getUserId } from "../authorization";
import { database } from "../database";
import { ActivityRecord } from "../utils/types";

const httpTrigger: AzureFunction = async function (
  context: Context,
  req: HttpRequest
): Promise<void> {
  const activity = req.body;
  const idToken = req.headers["x-auth-token"];
  let userId: string;
  try {
    userId = await getUserId(idToken);
  } catch (err) {
    context.res = { status: 401, body: err.message };
    return;
  }

  if (isActivityValid(activity)) {
    try {
      await database.addActivity(userId, activity);
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

const isActivityValid = (activity): activity is ActivityRecord => {
  const castedActivity = activity as ActivityRecord;
  if (castedActivity == null || castedActivity === undefined) {
    return false;
  }

  if (!moment(castedActivity.date, "YYYY-MM-DD", true).isValid()) {
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
