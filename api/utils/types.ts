export type Activity = {
  name: string;
  active: boolean;
};

export type ActivityRecord = {
  date: string;
} & Activity;

export type ActivityMap = {
  [key: string]: ActivityRecord;
};

export type ActivityRecordWithId = ActivityRecord & { id: string };

export type Category = {
  name: string;
  active: boolean;
  description: string;
  subcategories: Subcategory[];
};

export type Subcategory = {
  name: string;
  description: string;
};
