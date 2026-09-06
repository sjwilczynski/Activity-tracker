import { RouteErrorBoundary } from "../../components/states/RouteErrorBoundary";
import { runAction } from "../../data/actions";
import { activitiesWithLimitQueryOptions } from "../../data/queryOptions";
import { Welcome as WelcomePage } from "../../pages/Welcome";
import { getLoadContext } from "../root";
import type { Route } from "./+types/welcome";

export { RouteErrorBoundary as ErrorBoundary };

export async function clientLoader() {
  const { queryClient, getAuthToken, authService } = getLoadContext();
  await authService.waitForAuth();
  await queryClient.ensureQueryData(
    activitiesWithLimitQueryOptions(getAuthToken)
  );
  return null;
}

export function clientAction({ request }: Route.ClientActionArgs) {
  return runAction(request, getLoadContext(), "welcome");
}

export default function Welcome() {
  return <WelcomePage />;
}
