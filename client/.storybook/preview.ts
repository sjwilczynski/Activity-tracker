import type { Preview } from "@storybook/react-vite";
import { Chart } from "chart.js";
import MockDate from "mockdate";
import { initialize, mswLoader } from "msw-storybook-addon";
import { reactRouterParameters } from "storybook-addon-remix-react-router";
import { configure, sb } from "storybook/test";
import "../src/app/globals.css";
import { REFERENCE_DATE } from "../src/mocks/data/activities";
import { withAllProviders, withRouter } from "../src/mocks/decorators";
import { handlers } from "../src/mocks/handlers";
import { testContext } from "../src/mocks/testContext";

// Disable Chart.js animations in Storybook to fix rendering issues
// in the constrained iframe environment
Chart.defaults.animation = false;

// Initialize MSW
initialize({
  onUnhandledRequest: "bypass",
});

// Mock the system date to 2 days after the reference date used in mock data
// This ensures date-dependent features (like "show current month") work correctly
// and better represents typical usage where users view past activities
const mockedDate = new Date(REFERENCE_DATE);
mockedDate.setDate(mockedDate.getDate() + 2);
MockDate.set(mockedDate);

configure({
  asyncUtilTimeout: 3000,
});

// Mock the useAuth module to avoid Firebase dependency
sb.mock(import("../src/auth/useAuth.ts"));

// Mock action that performs API calls and invalidates queries
const mockAction = async ({ request }: { request: Request }) => {
  const formData = await request.formData();
  const intent = formData.get("intent");
  const token = "mock-token-12345";

  try {
    let response: Response | undefined;

    if (intent === "add") {
      const activities = formData.get("activities") as string;
      response = await fetch("/api/activities", {
        method: "POST",
        headers: {
          "x-auth-token": token,
          "Content-Type": "application/json",
        },
        body: activities,
      });
    }

    if (intent === "edit") {
      const id = formData.get("id") as string;
      const record = formData.get("record") as string;
      response = await fetch(`/api/activities/${id}`, {
        method: "PUT",
        headers: {
          "x-auth-token": token,
          "Content-Type": "application/json",
        },
        body: record,
      });
    }

    if (intent === "delete") {
      const id = formData.get("id") as string;
      response = await fetch(`/api/activities/${id}`, {
        method: "DELETE",
        headers: { "x-auth-token": token },
      });
    }

    if (intent === "delete-all") {
      response = await fetch("/api/activities", {
        method: "DELETE",
        headers: { "x-auth-token": token },
      });
    }

    if (response && !response.ok) {
      return { error: `HTTP error! status: ${response.status}` };
    }

    await testContext.invalidateActivities();

    return { ok: true };
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Unknown error" };
  }
};

const preview: Preview = {
  parameters: {
    a11y: {
      // 'todo' - show a11y violations in the test UI only
      // 'error' - fail CI on a11y violations
      // 'off' - skip a11y checks entirely
      test: "todo",
    },

    msw: {
      handlers: handlers,
    },

    reactRouter: reactRouterParameters({
      routing: [
        {
          path: "/",
          useStoryElement: true,
          action: mockAction,
        },
        {
          path: "/welcome",
          action: mockAction,
        },
        {
          path: "/activity-list",
          action: mockAction,
        },
        {
          path: "/profile",
          action: mockAction,
        },
        {
          path: "/charts",
          action: mockAction,
        },
      ],
    }),
  },
  decorators: [withRouter, withAllProviders],
  loaders: [mswLoader],
};

export default preview;
