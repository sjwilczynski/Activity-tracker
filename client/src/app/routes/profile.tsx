import { activitiesQueryOptions } from "../../data/queryOptions";
import { Profile as ProfilePage } from "../../pages/Profile";
import { getLoadContext } from "../root";

export async function clientLoader() {
  const { queryClient, getAuthToken } = getLoadContext();
  await queryClient.ensureQueryData(activitiesQueryOptions(getAuthToken));
  return null;
}

export default function Profile() {
  return <ProfilePage />;
}
