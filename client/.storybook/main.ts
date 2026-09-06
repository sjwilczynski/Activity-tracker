import { dirname } from "path";
import { fileURLToPath } from "url";
import type { StorybookConfig } from "@storybook/react-vite";
import tailwindcss from "@tailwindcss/postcss";
import type { Alias, AliasOptions } from "vite";

/**
 * This function is used to resolve the absolute path of a package.
 * It is needed in projects that use Yarn PnP or are set up within a monorepo.
 */
function getAbsolutePath(value: string) {
  return dirname(fileURLToPath(import.meta.resolve(`${value}/package.json`)));
}

function isAliasArray(aliases: AliasOptions): aliases is readonly Alias[] {
  return Array.isArray(aliases);
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
    // Use PostCSS with @tailwindcss/postcss for Storybook
    // (the @tailwindcss/vite plugin doesn't process CSS in Storybook's pipeline)
    config.css = config.css ?? {};
    config.css.postcss = {
      plugins: [tailwindcss],
    };

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
    const firebaseAuthMockPath = fileURLToPath(
      new URL("../__mocks__/firebase/auth.js", import.meta.url)
    );
    const existingAlias = config.resolve.alias ?? [];
    config.resolve.alias = isAliasArray(existingAlias)
      ? [
          ...existingAlias,
          { find: "firebase/auth", replacement: firebaseAuthMockPath },
        ]
      : { ...existingAlias, "firebase/auth": firebaseAuthMockPath };

    return config;
  },
};
export default config;
