import { RouteErrorBoundary } from "../../components/states/RouteErrorBoundary";
import { runAction } from "../../data/actions";
import {
  activitiesQueryOptions,
  categoriesQueryOptions,
} from "../../data/queryOptions";
import { ActivityList as ActivityListPage } from "../../pages/ActivityList";
import { getLoadContext } from "../root";
import type { Route } from "./+types/activity-list";

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
  return runAction(request, getLoadContext());
}

export default function ActivityList() {
  return <ActivityListPage />;
}
