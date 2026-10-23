import { createFileRoute } from "@tanstack/react-router";
import { Settings } from "../../pages/Settings";

export const Route = createFileRoute("/_authenticated/settings")({
  loader: async ({ context }) => {
    await Promise.all([
      context.queryClient.query({
        ...context.activitiesQuery,
        staleTime: "static",
      }),
      context.queryClient.query({
        ...context.categoriesQuery,
        staleTime: "static",
      }),
    ]);
  },
  component: Settings,
});
