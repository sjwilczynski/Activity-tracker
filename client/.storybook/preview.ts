import type { Preview } from "@storybook/tanstack-react";
import { Chart } from "chart.js";
import MockDate from "mockdate";
import { RequestHandler } from "msw";
import { mswLoader } from "msw-storybook-addon/csf3";
import { setupWorker } from "msw/browser";
import { toast } from "sonner";
import { configure } from "storybook/test";
import { z } from "zod";
import "../src/app/globals.css";
import { authActions } from "../src/mocks/auth";
import { REFERENCE_DATE } from "../src/mocks/data/activities";
import {
  handlers,
  resetActivities,
  resetCategories,
  resetPreferences,
} from "../src/mocks/handlers";
import {
  createStoryServices,
  routeTree,
  StoryLayout,
  withStoryServices,
} from "./tanstack";

Chart.defaults.animation = false;

const mockedDate = new Date(REFERENCE_DATE);
mockedDate.setDate(mockedDate.getDate() + 2);
MockDate.set(mockedDate);
configure({ asyncUtilTimeout: 6000 });

const loadMocks = mswLoader(async () => {
  const worker = setupWorker();
  await worker.start({ onUnhandledRequest: "bypass" });
  return worker;
});

function resetStoryData() {
  toast.dismiss();
  resetActivities();
  resetCategories();
  resetPreferences();
  authActions.signInWithGoogle.mockReset();
  authActions.signInWithEmail.mockReset();
  authActions.signUp.mockReset();
}

const preview: Preview<typeof routeTree> = {
  parameters: {
    a11y: { test: "todo" },
    msw: { handlers },
    tanstack: {
      router: {
        route: routeTree,
        path: "/welcome",
        context: ({ storyContext }) =>
          storyContext.loaded.services.routerContext,
        routeOverrides: { "/_authenticated": { component: StoryLayout } },
      },
    },
  },
  decorators: [withStoryServices],
  loaders: [
    async (context) => {
      resetStoryData();
      const overrides = z
        .array(z.instanceof(RequestHandler))
        .parse(context.parameters.msw?.handlers ?? []);
      await loadMocks({
        ...context,
        parameters: {
          ...context.parameters,
          msw: { handlers: [...overrides, ...handlers] },
        },
      });
      return {
        services: createStoryServices(
          context.parameters.tanstack?.router?.path ?? "/welcome"
        ),
      };
    },
  ],
};

export default preview;
