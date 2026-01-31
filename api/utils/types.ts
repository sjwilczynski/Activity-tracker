export type Activity = {
  name: string;
  active: boolean;
};

export type ActivityRecord = {
  date: string;
} & Activity;

export type ActivityMap = Record<string, ActivityRecord>;

export type Category = {
  name: string;
  active: boolean;
  description: string;
  subcategories: Subcategory[];
};

export type CategoryMap = Record<string, Category>;

export type Subcategory = {
  name: string;
  description: string;
};
