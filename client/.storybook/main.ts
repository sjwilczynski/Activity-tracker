import type { StorybookConfig } from "@storybook/react-vite";
import { dirname } from "path";
import { fileURLToPath } from "url";

/**
 * This function is used to resolve the absolute path of a package.
 * It is needed in projects that use Yarn PnP or are set up within a monorepo.
 */
function getAbsolutePath(value: string) {
  return dirname(fileURLToPath(import.meta.resolve(`${value}/package.json`)));
}

const config: StorybookConfig = {
  stories: ["../src/**/*.stories.@(ts|tsx)"],
  addons: [
    getAbsolutePath("@storybook/addon-vitest"),
    getAbsolutePath("@storybook/addon-a11y"),
    getAbsolutePath("@chromatic-com/storybook"),
    getAbsolutePath("storybook-addon-remix-react-router"),
  ],
  framework: getAbsolutePath("@storybook/react-vite"),
  viteFinal: (config) => {
    // Remove VitePWA plugin for Storybook builds (it causes issues with large manager files)
    config.plugins = config.plugins?.filter(
      (plugin) =>
        !plugin ||
        (typeof plugin === "object" &&
          "name" in plugin &&
          !plugin.name?.startsWith("vite-plugin-pwa"))
    );

    // Mock firebase/auth — sb.mock automocking doesn't support modules
    // using `export *` (like firebase/auth which re-exports @firebase/auth)
    config.resolve = config.resolve ?? {};
    config.resolve.alias = {
      ...config.resolve?.alias,
      "firebase/auth": new URL("../__mocks__/firebase/auth.js", import.meta.url)
        .pathname,
    };

    return config;
  },
};
export default config;
