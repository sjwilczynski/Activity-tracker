import { createFileRoute } from "@tanstack/react-router";
import { Compare } from "../../pages/Compare";

export const Route = createFileRoute("/_authenticated/compare")({
  loader: async ({ context }) => {
    await context.queryClient.query({
      ...context.activitiesQuery,
      staleTime: "static",
    });
  },
  component: Compare,
});
