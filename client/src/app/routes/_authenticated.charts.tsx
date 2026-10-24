import { CancelledError } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { lazy, Suspense } from "react";
import type { PrototypeVariant } from "../../pages/chart-prototype/PrototypeSwitcher";
import { Charts } from "../../pages/Charts";

const Prototype = import.meta.env.DEV
  ? lazy(() => import("../../pages/chart-prototype/ChartPrototype"))
  : null;

export const Route = createFileRoute("/_authenticated/charts")({
  validateSearch: (
    search: Record<string, unknown>
  ): { variant?: PrototypeVariant } => ({
    variant:
      import.meta.env.DEV &&
      (search.variant === "baseline" ||
        search.variant === "parity" ||
        search.variant === "clarity")
        ? search.variant
        : undefined,
  }),
  loader: async ({ context }) => {
    void context.queryClient
      .query(context.categoriesQuery)
      .catch((error: unknown) => {
        if (!(error instanceof CancelledError))
          console.error("Categories prefetch failed", error);
      });
    await context.queryClient.query({
      ...context.activitiesQuery,
      staleTime: "static",
    });
  },
  component: ChartsRoute,
});

function ChartsRoute() {
  const { variant } = Route.useSearch();
  return Prototype ? (
    <Suspense fallback={<p role="status">Loading chart prototype...</p>}>
      <Prototype variant={variant ?? "clarity"} />
    </Suspense>
  ) : (
    <Charts />
  );
}
