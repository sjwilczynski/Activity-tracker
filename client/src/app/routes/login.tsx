import { createFileRoute, redirect } from "@tanstack/react-router";
import { Login } from "../../auth/Login";
import { safeReturnTo } from "../search";

export const Route = createFileRoute("/login")({
  validateSearch: (search: Record<string, unknown>) => ({
    returnTo: safeReturnTo(search.returnTo),
  }),
  beforeLoad: async ({ context, search }) => {
    await context.authService.waitForAuth();
    if (context.authService.getUser()) {
      throw redirect({ href: safeReturnTo(search.returnTo), replace: true });
    }
  },
  component: Login,
});
