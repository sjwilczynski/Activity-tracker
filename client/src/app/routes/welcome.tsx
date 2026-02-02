import { activitiesWithLimitQueryOptions } from "../../data/queryOptions";
import { Welcome as WelcomePage } from "../../pages/Welcome";
import { getLoadContext } from "../root";

export async function clientLoader() {
  const { queryClient, getAuthToken } = getLoadContext();
  await queryClient.ensureQueryData(
    activitiesWithLimitQueryOptions(getAuthToken)
  );
  return null;
}

export default function Welcome() {
  return <WelcomePage />;
}
