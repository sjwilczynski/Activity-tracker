import { configure } from "storybook/test";

// Configure global timeout for async operations (waitFor, findBy*, etc.)
configure({
  asyncUtilTimeout: 10000,
});
