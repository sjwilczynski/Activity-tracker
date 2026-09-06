import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/")({
  beforeLoad: ({ search, location }) => {
    throw redirect({
      to: "/welcome",
      search,
      hash: location.hash,
      replace: true,
    });
  },
});
