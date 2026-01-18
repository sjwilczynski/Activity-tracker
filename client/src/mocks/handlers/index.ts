export {
  activityHandlers,
  activityErrorHandlers,
  resetActivities,
} from "./activities";
export { categoryHandlers, categoryErrorHandlers } from "./categories";

import { activityHandlers } from "./activities";
import { categoryHandlers } from "./categories";

export const handlers = [...activityHandlers, ...categoryHandlers];
