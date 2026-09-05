import type { Preview } from "@storybook/react-vite";
import { Chart } from "chart.js";
import MockDate from "mockdate";
import { initialize, mswLoader } from "msw-storybook-addon";
import { reactRouterParameters } from "storybook-addon-remix-react-router";
import { configure, sb } from "storybook/test";
import "../src/app/globals.css";
import { runAction } from "../src/data/actions";
import { REFERENCE_DATE } from "../src/mocks/data/activities";
import { withAllProviders, withRouter } from "../src/mocks/decorators";
import {
  handlers,
  resetActivities,
  resetCategories,
  resetPreferences,
} from "../src/mocks/handlers";
import { testContext } from "../src/mocks/testContext";

Chart.defaults.animation = false;
initialize({ onUnhandledRequest: "bypass" });

const mockedDate = new Date(REFERENCE_DATE);
mockedDate.setDate(mockedDate.getDate() + 2);
MockDate.set(mockedDate);
configure({ asyncUtilTimeout: 6000 });
sb.mock(import("../src/auth/useAuth.ts"));

const action = ({ request }: { request: Request }) => {
  const queryClient = testContext.getQueryClient();
  if (!queryClient)
    throw new Error("Storybook QueryClient has not been initialized");
  return runAction(request, {
    queryClient,
    getAuthToken: async () => "mock-token-12345",
  });
};

const preview: Preview = {
  beforeEach: () => {
    resetActivities();
    resetCategories();
    resetPreferences();
  },
  parameters: {
    a11y: { test: "todo" },
    msw: { handlers },
    reactRouter: reactRouterParameters({
      routing: [
        { path: "/", useStoryElement: true, action },
        { path: "/welcome", action },
        { path: "/activity-list", action },
        { path: "/settings", action },
        { path: "/charts", action },
      ],
    }),
  },
  decorators: [withRouter, withAllProviders],
  loaders: [mswLoader],
};

export default preview;
