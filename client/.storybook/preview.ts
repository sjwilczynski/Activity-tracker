import type { Preview } from "@storybook/react-vite";
import { sb, configure } from "storybook/test";
import { initialize, mswLoader } from "msw-storybook-addon";
import MockDate from "mockdate";
import { handlers } from "../src/mocks/handlers";
import { withAllProviders } from "../src/mocks/decorators";
import { REFERENCE_DATE } from "../src/mocks/data/activities";

// Initialize MSW
initialize({
  onUnhandledRequest: "bypass",
});

// Mock the system date to match the reference date used in mock data
// This ensures date-dependent features (like "show current month") work correctly
MockDate.set(REFERENCE_DATE);

configure({
  asyncUtilTimeout: 3000,
});

// Mock the useAuth module to avoid Firebase dependency
sb.mock(import("../src/auth/useAuth.ts"));

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },

    a11y: {
      // 'todo' - show a11y violations in the test UI only
      // 'error' - fail CI on a11y violations
      // 'off' - skip a11y checks entirely
      test: "todo",
    },

    msw: {
      handlers: handlers,
    },
  },
  decorators: [withAllProviders],
  loaders: [mswLoader],
};

export default preview;
