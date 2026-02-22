export {
  activityErrorHandlers,
  activityHandlers,
  resetActivities,
} from "./activities";
export { activityBulkHandlers } from "./activity-bulk-ops";
export {
  categoryErrorHandlers,
  categoryHandlers,
  resetCategories,
} from "./categories";
export { preferencesHandlers } from "./preferences";

import { activityHandlers } from "./activities";
import { activityBulkHandlers } from "./activity-bulk-ops";
import { categoryHandlers } from "./categories";
import { preferencesHandlers } from "./preferences";

export const handlers = [
  ...activityHandlers,
  ...activityBulkHandlers,
  ...categoryHandlers,
  ...preferencesHandlers,
];
