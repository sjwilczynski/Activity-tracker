import type { Preview } from "@storybook/react-vite";
import { Chart } from "chart.js";
import MockDate from "mockdate";
import { initialize, mswLoader } from "msw-storybook-addon";
import { reactRouterParameters } from "storybook-addon-remix-react-router";
import { configure, sb } from "storybook/test";
import "../src/app/globals.css";
import { REFERENCE_DATE } from "../src/mocks/data/activities";
import { withAllProviders, withRouter } from "../src/mocks/decorators";
import { handlers, resetActivities, resetCategories } from "../src/mocks/handlers";
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
  asyncUtilTimeout: 6000,
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

    if (intent === "rename-activity") {
      const oldName = formData.get("oldName") as string;
      const newName = formData.get("newName") as string;
      response = await fetch("/api/activities/rename", {
        method: "POST",
        headers: {
          "x-auth-token": token,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ oldName, newName }),
      });
    }

    if (intent === "assign-category") {
      const activityName = formData.get("activityName") as string;
      const categoryId = formData.get("categoryId") as string;
      response = await fetch("/api/activities/assign-category", {
        method: "POST",
        headers: {
          "x-auth-token": token,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ activityName, categoryId }),
      });
    }

    if (intent === "add-activity-name") {
      const activityName = formData.get("activityName") as string;
      const categoryId = formData.get("categoryId") as string;
      response = await fetch(`/api/categories/${categoryId}/activity-names`, {
        method: "POST",
        headers: {
          "x-auth-token": token,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ activityName }),
      });
    }

    if (response && !response.ok) {
      return { error: `HTTP error! status: ${response.status}` };
    }

    await testContext.invalidateActivities();
    await testContext.invalidateCategories();

    return { ok: true };
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Unknown error" };
  }
};

const preview: Preview = {
  beforeEach: () => {
    // Reset mutable MSW handler state between stories to prevent leaks
    // (e.g. DeleteAllConfirmation emptying activities for subsequent stories)
    resetActivities();
    resetCategories();
  },
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
          path: "/settings",
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
