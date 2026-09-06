import path from "node:path";
/// <reference types="vitest/config" />
import { storybookTest } from "@storybook/addon-vitest/vitest-plugin";
import tailwindcss from "@tailwindcss/vite";
import { tanstackRouter } from "@tanstack/router-plugin/vite";
import react from "@vitejs/plugin-react";
import { playwright } from "@vitest/browser-playwright";
import { defineConfig, type UserConfig } from "vite";
import { VitePWA } from "vite-plugin-pwa";
import { reactCompiler } from "./vite/react-compiler.ts";
const dirname = import.meta.dirname;

// Check if we're in a Storybook or Vitest environment
const isStorybook =
  process.argv[1]?.includes("storybook") || process.env.STORYBOOK === "true";
const isVitest =
  process.env.VITEST === "true" || process.argv.includes("vitest");

const isE2E = process.env.E2E === "true";

// More info at: https://storybook.js.org/docs/next/writing-tests/integrations/vitest-addon
export default defineConfig((): UserConfig => {
  return {
    plugins: [
      ...(isE2E
        ? [
            {
              name: "e2e-entry-swap",
              transformIndexHtml: {
                order: "pre" as const,
                handler: (html: string) =>
                  html.replace("/src/main.tsx", "/src/main.e2e.tsx"),
              },
            },
          ]
        : []),
      ...(!isStorybook && !isVitest && !isE2E
        ? [
            VitePWA({
              registerType: "autoUpdate",
              outDir: "build/client",
              manifest: {
                name: "Activity tracker",
                short_name: "AT",
                lang: "en",
                description: "A place to track and review all your activities",
                start_url: ".",
                background_color: "#f2f2f2",
                theme_color: "#4479a2",
                dir: "ltr",
                display: "standalone",
                icons: [
                  {
                    src: "favicon.ico",
                    sizes: "64x64 32x32 24x24 16x16",
                    type: "image/x-icon",
                  },
                  {
                    src: "android-chrome-192x192.png",
                    sizes: "192x192",
                    type: "image/png",
                    purpose: "any maskable",
                  },
                  {
                    src: "android-chrome-512x512.png",
                    sizes: "512x512",
                    type: "image/png",
                    purpose: "any maskable",
                  },
                ],
              },
              workbox: {
                globPatterns: ["**/*.{js,css,html,ico,png,svg}"],
              },
            }),
          ]
        : []),
      tailwindcss(),
      tanstackRouter({ target: "react", autoCodeSplitting: true }),
      react(),
      reactCompiler(),
    ],
    optimizeDeps: {
      include: ["@tanstack/react-query", "@tanstack/react-router", "zod"],
    },
    resolve: {
      tsconfigPaths: true,
    },
    base: "/",
    build: {
      outDir: "build/client",
      target: ["chrome107", "edge107", "firefox104", "safari16"],
    },
    server: {
      port: 3000,
      host: "localhost",
      proxy: {
        "/api": {
          target: "http://localhost:7071/",
        },
      },
    },
    test: {
      projects: [
        {
          extends: true,
          test: {
            name: "unit",
            include: ["src/**/*.test.{ts,tsx}", "vite/**/*.test.ts"],
            environment: "node",
          },
        },
        {
          extends: true,
          plugins: [
            // The plugin will run tests for the stories defined in your Storybook config
            // See options at: https://storybook.js.org/docs/next/writing-tests/integrations/vitest-addon#storybooktest
            storybookTest({
              configDir: path.join(dirname, ".storybook"),
            }),
          ],
          test: {
            name: "storybook",
            browser: {
              enabled: true,
              headless: true,
              provider: playwright({}),
              instances: [
                {
                  browser: "chromium",
                },
              ],
            },
            setupFiles: [".storybook/vitest.setup.ts"],
          },
        },
      ],
    },
  };
});
