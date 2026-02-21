import { RouteErrorBoundary } from "../../components/states/RouteErrorBoundary";
import { activitiesQueryOptions } from "../../data/queryOptions";
import { Compare as ComparePage } from "../../pages/Compare";
import { getLoadContext } from "../root";

export { RouteErrorBoundary as ErrorBoundary };

export async function clientLoader() {
  const { queryClient, getAuthToken, authService } = getLoadContext();
  await authService.waitForAuth();
  await queryClient.ensureQueryData(activitiesQueryOptions(getAuthToken));
  return null;
}

export default function Compare() {
  return <ComparePage />;
}
