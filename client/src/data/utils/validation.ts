import { isMatch } from "date-fns";
import type { ActivityRecordServer } from "../types";

export const areActivitiesValid = (
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
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

const isActivityValid = (
  activity: unknown
): activity is ActivityRecordServer => {
  const castedActivity = activity as ActivityRecordServer;
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
