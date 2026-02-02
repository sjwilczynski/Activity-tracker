import { activitiesQueryOptions } from "../../data/queryOptions";
import { ActivityList as ActivityListPage } from "../../pages/ActivityList";
import { getLoadContext } from "../root";

export async function clientLoader() {
  const { queryClient, getAuthToken } = getLoadContext();
  await queryClient.ensureQueryData(activitiesQueryOptions(getAuthToken));
  return null;
}

export default function ActivityList() {
  return <ActivityListPage />;
}
