import * as a11yAddonAnnotations from "@storybook/addon-a11y/preview";
import { setProjectAnnotations } from "@storybook/react-vite";
import { configure } from "storybook/test";
import * as projectAnnotations from "./preview";

// Configure global timeout for async operations (waitFor, findBy*, etc.)
configure({
  asyncUtilTimeout: 10000,
});

// This is an important step to apply the right configuration when testing your stories.
// More info at: https://storybook.js.org/docs/api/portable-stories/portable-stories-vitest#setprojectannotations
setProjectAnnotations([a11yAddonAnnotations, projectAnnotations]);
