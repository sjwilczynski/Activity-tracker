import { setupWorker } from "msw/browser";
import { handlers } from "./mocks/handlers";
import { setActivities } from "./mocks/handlers/activities";
import { setCategories } from "./mocks/handlers/categories";
import {
  prototypeActivities,
  prototypeCategories,
} from "./pages/chart-prototype/fixtures";

setActivities(prototypeActivities);
setCategories(prototypeCategories);
const worker = setupWorker(...handlers);
await worker.start({
  onUnhandledRequest(request, print) {
    if (new URL(request.url).pathname.startsWith("/api/")) print.error();
  },
});
if (window.location.pathname === "/") {
  window.history.replaceState(null, "", "/charts?variant=parity");
}
await import("./main.e2e");
