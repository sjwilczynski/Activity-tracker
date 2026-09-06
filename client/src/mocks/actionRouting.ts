import { reactRouterParameters } from "storybook-addon-remix-react-router";
import { runAction, type ActionRoute } from "../data/actions";
import { testContext } from "./testContext";

const action =
  (route: ActionRoute) =>
  ({ request }: { request: Request }) => {
    const queryClient = testContext.getQueryClient();
    if (!queryClient)
      throw new Error("Storybook QueryClient has not been initialized");
    return runAction(
      request,
      {
        queryClient,
        getAuthToken: async () => "mock-token-12345",
      },
      route
    );
  };

export function actionRouting(storyRoute?: ActionRoute) {
  return reactRouterParameters({
    location: { path: storyRoute ? `/${storyRoute}` : "/" },
    routing: [
      { path: "/", useStoryElement: storyRoute === undefined },
      {
        path: "/welcome",
        useStoryElement: storyRoute === "welcome",
        action: action("welcome"),
      },
      {
        path: "/activity-list",
        useStoryElement: storyRoute === "activity-list",
        action: action("activity-list"),
      },
      {
        path: "/settings",
        useStoryElement: storyRoute === "settings",
        action: action("settings"),
      },
      { path: "/charts" },
    ],
  });
}
