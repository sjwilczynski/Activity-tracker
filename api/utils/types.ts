export type Activity = {
  name: string;
  active: boolean;
};

export type ActivityRecord = {
  date: string;
  activity: Activity;
};