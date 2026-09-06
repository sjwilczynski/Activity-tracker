import { RouteErrorBoundary } from "../../components/states/RouteErrorBoundary";
import { runAction } from "../../data/actions";
import {
  activitiesQueryOptions,
  categoriesQueryOptions,
} from "../../data/queryOptions";
import { Settings as SettingsPage } from "../../pages/Settings";
import { getLoadContext } from "../root";
import type { Route } from "./+types/settings";

export { RouteErrorBoundary as ErrorBoundary };

export async function clientLoader() {
  const { queryClient, getAuthToken, authService } = getLoadContext();
  await authService.waitForAuth();
  await Promise.all([
    queryClient.ensureQueryData(activitiesQueryOptions(getAuthToken)),
    queryClient.ensureQueryData(categoriesQueryOptions(getAuthToken)),
  ]);
  return null;
}

export function clientAction({ request }: Route.ClientActionArgs) {
  return runAction(request, getLoadContext(), "settings");
}

export default function Settings() {
  return <SettingsPage />;
}
