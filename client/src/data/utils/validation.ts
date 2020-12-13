import { ActivityRecordServer } from "../types";
import { isMatch } from "date-fns";

export const areActivitiesValid = (
  activityRecords: any
): activityRecords is ActivityRecordServer[] => {
  if (
    !activityRecords ||
    !activityRecords.length ||
    activityRecords.length === 0
  ) {
    return false;
  }
  return activityRecords.every(isActivityValid);
};

const isActivityValid = (activity: any): activity is ActivityRecordServer => {
  const castedActivity = activity as ActivityRecordServer;
  if (castedActivity == null || castedActivity === undefined) {
    return false;
  }

  if (!isMatch(castedActivity.date, "YYYY-MM-DD")) {
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
