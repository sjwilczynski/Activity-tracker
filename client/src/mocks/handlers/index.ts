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
export {
  darkPreferencesHandler,
  preferencesHandlers,
  resetPreferences,
} from "./preferences";

import { activityHandlers } from "./activities";
import { activityBulkHandlers } from "./activity-bulk-ops";
import { backupHandlers } from "./backup";
import { categoryHandlers } from "./categories";
import { preferencesHandlers } from "./preferences";

export const handlers = [
  ...backupHandlers,
  ...activityHandlers,
  ...activityBulkHandlers,
  ...categoryHandlers,
  ...preferencesHandlers,
];
