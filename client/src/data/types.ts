export type Activity = {
  name: string;
  active: boolean;
};

export type Category = {
  name: string;
  active: boolean;
  description: string;
  subcategories?: Subcategory[];
};

export type Subcategory = {
  name: string;
  description: string;
};

export type CategoryOption = {
  name: string;
  active: boolean;
  categoryName: string;
  description?: string;
};

export type ActivityRecord = {
  date: Date;
} & Activity;

export type ActivityRecordServer = {
  date: string;
} & Activity;

export type ActivityRecordWithId = { id: string } & ActivityRecord;

export type ActivityRecordWithIdServer = { id: string } & ActivityRecordServer;

export type ActivitySummary = {
  count: number;
  active: boolean;
};

export type ActivitySummaries = {
  [key: string]: ActivitySummary;
};
