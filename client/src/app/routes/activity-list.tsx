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
    queryClient.query({
      ...activitiesQueryOptions(getAuthToken),
      staleTime: "static",
    }),
    queryClient.query({
      ...categoriesQueryOptions(getAuthToken),
      staleTime: "static",
    }),
  ]);
  return null;
}

export function clientAction({ request }: Route.ClientActionArgs) {
  return runAction(request, getLoadContext(), "activity-list");
}

export default function ActivityList() {
  return <ActivityListPage />;
}
