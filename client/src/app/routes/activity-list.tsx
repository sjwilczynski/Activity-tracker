import { activitiesQueryOptions } from "../../data/queryOptions";
import { ActivityList as ActivityListPage } from "../../pages/ActivityList";
import { getLoadContext } from "../root";
import type { Route } from "./+types/activity-list";

export async function clientLoader() {
  const { queryClient, getAuthToken } = getLoadContext();
  await queryClient.ensureQueryData(activitiesQueryOptions(getAuthToken));
  return null;
}

export async function clientAction({ request }: Route.ClientActionArgs) {
  const { queryClient, getAuthToken } = getLoadContext();
  const formData = await request.formData();
  const intent = formData.get("intent");
  const token = await getAuthToken();

  if (intent === "edit") {
    const id = formData.get("id") as string;
    const record = JSON.parse(formData.get("record") as string);

    const response = await fetch(`/api/activities/${id}`, {
      method: "PUT",
      headers: {
        "x-auth-token": token,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(record),
    });

    if (!response.ok) {
      return { error: `HTTP error! status: ${response.status}` };
    }
  }

  if (intent === "delete") {
    const id = formData.get("id") as string;

    const response = await fetch(`/api/activities/${id}`, {
      method: "DELETE",
      headers: { "x-auth-token": token },
    });

    if (!response.ok) {
      return { error: `HTTP error! status: ${response.status}` };
    }
  }

  await queryClient.invalidateQueries({ queryKey: ["activities"] });
  await queryClient.invalidateQueries({ queryKey: ["activitiesWithLimit"] });

  return { ok: true };
}

export default function ActivityList() {
  return <ActivityListPage />;
}
