import { ActivityRecordServer } from "../types";

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
  // TODO: bring back date validation
  //   if (!moment(castedActivity.date, "YYYY-MM-DD", true).isValid()) {
  //     return false;
  //   }

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
