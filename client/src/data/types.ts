export type Activity = {
  name: string;
  active: boolean;
};

export type ActivityRecord = {
  date: string;
  activity: Activity;
};

export type ActivitySummary = {
  count: number;
  active: boolean;
};

export type ActivitySummaryMap = {
  [key: string]: ActivitySummary;
};

export type GetIdToken = (() => Promise<string>) | undefined;
