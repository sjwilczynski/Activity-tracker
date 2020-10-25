import { ActivityRecordWithId, ActivitySummaries } from "../types";

export function transformDataToSummaryMap(records: ActivityRecordWithId[]) {
  const activitySummary = records.reduce(
    (summary: ActivitySummaries, activityRecord: ActivityRecordWithId) => {
      const { name, active } = activityRecord;
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

export function filterByDateRange(
  records: ActivityRecordWithId[],
  startDate: Date | null,
  endDate: Date | null
) {
  return startDate && endDate
    ? records.filter(
        (record: ActivityRecordWithId) =>
          startDate <= record.date && record.date <= endDate
      )
    : records;
}

export function sortDescendingByDate(records: ActivityRecordWithId[]) {
  return records.sort((record1, record2) => {
    return record2.date.valueOf() - record1.date.valueOf();
  });
}
