export type Activity = {
  name: string;
  active: boolean;
};

export type ActivityRecord = {
  date: Date;
  activity: Activity;
};

export type ActivityRecordServer = {
  date: string;
  activity: Activity;
};

export type ActivityRecordWithId = { id: string } & ActivityRecord;

export type ActivityRecordWithIdServer = { id: string } & ActivityRecordServer;

export type ActivitySummary = {
  count: number;
  active: boolean;
};

export type ActivitySummaries = {
  [key: string]: ActivitySummary;
};

export type GetIdToken = (() => Promise<string>) | undefined;
