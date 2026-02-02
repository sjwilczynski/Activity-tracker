import { activitiesQueryOptions } from "../../data/queryOptions";
import { Charts as ChartsPage } from "../../pages/Charts";
import { getLoadContext } from "../root";

export async function clientLoader() {
  const { queryClient, getAuthToken } = getLoadContext();
  await queryClient.ensureQueryData(activitiesQueryOptions(getAuthToken));
  return null;
}

export default function Charts() {
  return <ChartsPage />;
}
