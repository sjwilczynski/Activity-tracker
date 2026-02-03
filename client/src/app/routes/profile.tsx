import { activitiesQueryOptions } from "../../data/queryOptions";
import { Profile as ProfilePage } from "../../pages/Profile";
import { getLoadContext } from "../root";
import type { Route } from "./+types/profile";

export async function clientLoader() {
  const { queryClient, getAuthToken } = getLoadContext();
  await queryClient.ensureQueryData(activitiesQueryOptions(getAuthToken));
  return null;
}

export async function clientAction({ request }: Route.ClientActionArgs) {
  const { queryClient, getAuthToken } = getLoadContext();
  const formData = await request.formData();
  const intent = formData.get("intent");

  if (intent === "delete-all") {
    const token = await getAuthToken();

    const response = await fetch("/api/activities", {
      method: "DELETE",
      headers: { "x-auth-token": token },
    });

    if (!response.ok) {
      return { error: `HTTP error! status: ${response.status}` };
    }

    await queryClient.invalidateQueries({ queryKey: ["activities"] });
    await queryClient.invalidateQueries({ queryKey: ["activitiesWithLimit"] });

    return { ok: true };
  }

  return { error: "Unknown intent" };
}

export default function Profile() {
  return <ProfilePage />;
}
