import { CancelledError } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { Charts } from "../../pages/Charts";

export const Route = createFileRoute("/_authenticated/charts")({
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
  component: Charts,
});
