import type { Preview } from "@storybook/react-vite";
import { sb } from "storybook/test";
import { initialize, mswLoader } from "msw-storybook-addon";
import { handlers } from "../src/mocks/handlers";
import { withAllProviders } from "../src/mocks/decorators";

// Mock the useAuth module to avoid Firebase dependency
sb.mock(import("../src/auth/useAuth.ts"));

// Initialize MSW
initialize({
  onUnhandledRequest: "bypass",
});

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
