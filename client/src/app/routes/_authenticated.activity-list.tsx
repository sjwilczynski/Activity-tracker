import { createFileRoute } from "@tanstack/react-router";
import { ActivityList } from "../../pages/ActivityList";

export const Route = createFileRoute("/_authenticated/activity-list")({
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
  component: ActivityList,
});
