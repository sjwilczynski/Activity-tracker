import { app, type HttpRequest, type HttpResponseInit } from "@azure/functions";
import { getUserId } from "../../authorization/firebaseAuthorization";
import { firebaseDB as database } from "../../database/firebaseDB";
import type { ActivityRecord } from "../../utils/types";
import { isMatch } from "date-fns";

async function addActivity(request: HttpRequest): Promise<HttpResponseInit> {
  let activities: unknown;
  try {
    activities = await request.json();
  } catch {
    return { status: 400, body: "Invalid JSON body" };
  }

  const idToken = request.headers.get("x-auth-token");
  let userId: string;
  try {
    userId = await getUserId(idToken);
  } catch (err) {
    return { status: 401, body: (err as Error).message };
  }

  if (areActivitiesValid(activities)) {
    try {
      await database.addActivities(userId, activities);
      return {
        status: 200,
        body: "Successfully added",
      };
    } catch (err) {
      return {
        status: 500,
        body: (err as Error).message,
      };
    }
  } else {
    return {
      status: 400, // Use 400 for invalid input
      body: "Activity data is invalid",
    };
  }
}

const areActivitiesValid = (
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  activityRecords: any
): activityRecords is ActivityRecord[] => {
  if (
    activityRecords === null ||
    activityRecords === undefined ||
    !Array.isArray(activityRecords) || // Check if it's an array
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

app.http("addActivity", {
  methods: ["POST"],
  authLevel: "anonymous",
  route: "activities",
  handler: addActivity,
});
