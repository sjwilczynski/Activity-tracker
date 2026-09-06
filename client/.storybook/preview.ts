import type { Preview } from "@storybook/react-vite";
import { Chart } from "chart.js";
import MockDate from "mockdate";
import { initialize, mswLoader } from "msw-storybook-addon";
import { configure, sb } from "storybook/test";
import "../src/app/globals.css";
import { actionRouting } from "../src/mocks/actionRouting";
import { REFERENCE_DATE } from "../src/mocks/data/activities";
import { withAllProviders, withRouter } from "../src/mocks/decorators";
import {
  handlers,
  resetActivities,
  resetCategories,
  resetPreferences,
} from "../src/mocks/handlers";

Chart.defaults.animation = false;
initialize({ onUnhandledRequest: "bypass" });

const mockedDate = new Date(REFERENCE_DATE);
mockedDate.setDate(mockedDate.getDate() + 2);
MockDate.set(mockedDate);
configure({ asyncUtilTimeout: 6000 });
sb.mock(import("../src/auth/useAuth.ts"));

const preview: Preview = {
  beforeEach: () => {
    resetActivities();
    resetCategories();
    resetPreferences();
  },
  parameters: {
    a11y: { test: "todo" },
    msw: { handlers },
    reactRouter: actionRouting(),
  },
  decorators: [withRouter, withAllProviders],
  loaders: [mswLoader],
};

export default preview;
