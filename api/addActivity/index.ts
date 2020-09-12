import { AzureFunction, Context, HttpRequest } from "@azure/functions";
import moment from "moment";
import { getUserId } from "../authorization";
import { database } from "../database";

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

  // TODO: make a proper type check here
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

function isActivityValid(activity) {
  if (!activity || !activity.date || !activity.activity) {
    return false;
  }

  if (!moment(activity.date, "YYYY-MM-DD", true).isValid()) {
    return false;
  }

  const { name, active } = activity.activity;
  if (!isValidName(name) || typeof active !== "boolean") {
    return false;
  }

  return true;
}

function isValidName(name: string) {
  return Boolean(name);
}

export default httpTrigger;
