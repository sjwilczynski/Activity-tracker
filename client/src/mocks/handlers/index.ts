export {
  activityErrorHandlers,
  activityHandlers,
  resetActivities,
} from "./activities";
export {
  categoryErrorHandlers,
  categoryHandlers,
  resetCategories,
} from "./categories";
export { preferencesHandlers } from "./preferences";

import { activityHandlers } from "./activities";
import { categoryHandlers } from "./categories";
import { preferencesHandlers } from "./preferences";

export const handlers = [
  ...activityHandlers,
  ...categoryHandlers,
  ...preferencesHandlers,
];
