import { createRootRouteWithContext, Outlet } from "@tanstack/react-router";
import type { RouterContext } from "../router-context";
import { validateAppSearch } from "../search";

export const Route = createRootRouteWithContext<RouterContext>()({
  component: Outlet,
  validateSearch: validateAppSearch,
});
