import { ActivityRecordWithId, ActivitySummaryMap } from "./../types";

export function transformDataToSummaryMap(records: ActivityRecordWithId[]) {
  const activitySummary = records.reduce(
    (summary: ActivitySummaryMap, activityRecord: ActivityRecordWithId) => {
      const { activity } = activityRecord;
      const { name, active } = activity;
      if (summary[name]) {
        summary[name].count += 1;
      } else {
        summary[name] = {
          count: 1,
          active,
        };
      }
      return summary;
    },
    {}
  );

  return activitySummary;
}
