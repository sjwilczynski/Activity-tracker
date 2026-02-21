// For more info, see https://github.com/storybookjs/eslint-plugin-storybook#configuration-flat-config-format
import storybook from "eslint-plugin-storybook";

import { FlatCompat } from "@eslint/eslintrc";
import js from "@eslint/js";
import tsParser from "@typescript-eslint/parser";
import { defineConfig, globalIgnores } from "eslint/config";
import globals from "globals";
import path from "node:path";
import { fileURLToPath } from "node:url";
import react from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: js.configs.recommended,
  allConfig: js.configs.all,
});

export default defineConfig([
  globalIgnores([
    "api/dist",
    "client/build",
    "**/node_modules/",
    "**/storybook-static/",
    "**/mockServiceWorker.js",
    "client/.react-router",
    "client/dev-dist",
  ]),
  {
    extends: compat.extends(
      "plugin:@typescript-eslint/recommended",
      "prettier"
    ),

    plugins: {
      react,
      "react-hooks": reactHooks,
    },

    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
      },

      parser: tsParser,
    },

    settings: {
      react: {
        // Hardcoded because React is in client/ workspace; "detect" warns since it's not at root
        version: "19",
      },
    },

    rules: {
      "@typescript-eslint/consistent-type-definitions": ["error", "type"],

      "@typescript-eslint/consistent-type-imports": [
        "error",
        {
          disallowTypeAnnotations: true,
          prefer: "type-imports",
        },
      ],

      // React recommended rules
      ...react.configs.flat.recommended.rules,
      ...react.configs.flat["jsx-runtime"].rules,
      "react/prop-types": "off",

      // React hooks
      // React hooks — manual rules instead of preset because v7 preset includes
      // React Compiler rules we're not ready for yet (tracked in CP9)
      "react-hooks/rules-of-hooks": "error",
      "react-hooks/exhaustive-deps": "error",
    },
  },
  ...storybook.configs["flat/recommended"],
]);
