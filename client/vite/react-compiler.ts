import { transform } from "oxc-transform-react";
import type { Plugin } from "vite";

export function reactCompiler(): Plugin {
  return {
    name: "activity-tracker:react-compiler",
    enforce: "pre",
    applyToEnvironment: (environment) =>
      environment.config.consumer === "client",
    config: () => ({
      optimizeDeps: { include: ["react/compiler-runtime"] },
    }),
    transform: {
      filter: {
        id: {
          include: /\/src\/.*\.[jt]sx?(?:\?.*)?$/,
          exclude: /\/node_modules\//,
        },
      },
      async handler(code, id) {
        const result = await transform(id.split("?")[0], code, {
          // React Router and Storybook's React plugin own JSX and Fast Refresh.
          jsx: "preserve",
          reactCompiler: {
            target: "19",
            eslintSuppressionRules: [
              "react-hooks/rules-of-hooks",
              "react-hooks/exhaustive-deps",
              "react/rules-of-hooks",
              "react/exhaustive-deps",
            ],
          },
          sourcemap:
            this.environment.config.command !== "build" ||
            Boolean(this.environment.config.build.sourcemap),
        });

        if (result.fatal) {
          this.error(
            result.errors
              .map((error) => `${error.message}\n${error.codeframe ?? ""}`)
              .join("\n") || "Native React Compiler transform failed"
          );
        }

        return { code: result.code, map: result.map };
      },
    },
  };
}
