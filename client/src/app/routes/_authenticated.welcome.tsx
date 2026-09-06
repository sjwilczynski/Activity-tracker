import { CancelledError } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { Welcome } from "../../pages/Welcome";
import { recentActivitiesQuery } from "../route-queries";

export const Route = createFileRoute("/_authenticated/welcome")({
  context: ({ context }) => ({
    recentActivitiesQuery: recentActivitiesQuery(context.getAuthToken),
  }),
  loader: ({ context }) => {
    for (const request of [
      context.queryClient.query(context.recentActivitiesQuery),
      context.queryClient.query(context.categoriesQuery),
      context.queryClient.query(context.activitiesQuery),
    ]) {
      void request.catch((error: unknown) => {
        if (!(error instanceof CancelledError))
          console.error("Dashboard prefetch failed", error);
      });
    }
  },
  component: Welcome,
});
