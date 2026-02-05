import { RouteErrorBoundary } from "../../components";
import { activitiesQueryOptions } from "../../data/queryOptions";
import { Charts as ChartsPage } from "../../pages/Charts";
import { getLoadContext } from "../root";

export { RouteErrorBoundary as ErrorBoundary };

export async function clientLoader() {
  const { queryClient, getAuthToken, authService } = getLoadContext();
  // Wait for auth to initialize (loaders run in parallel, so parent's waitForAuth may not have completed)
  await authService.waitForAuth();
  await queryClient.ensureQueryData(activitiesQueryOptions(getAuthToken));
  return null;
}

export default function Charts() {
  return <ChartsPage />;
}
