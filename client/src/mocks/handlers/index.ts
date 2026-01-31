export {
  activityErrorHandlers,
  activityHandlers,
  resetActivities,
} from "./activities";
export { categoryErrorHandlers, categoryHandlers } from "./categories";

import { activityHandlers } from "./activities";
import { categoryHandlers } from "./categories";

export const handlers = [...activityHandlers, ...categoryHandlers];
