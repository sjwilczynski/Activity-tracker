import { RouteErrorBoundary } from "../../components/states/RouteErrorBoundary";
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
  // Wait for auth to initialize (loaders run in parallel, so parent's waitForAuth may not have completed)
  await authService.waitForAuth();
  await Promise.all([
    queryClient.ensureQueryData(activitiesQueryOptions(getAuthToken)),
    queryClient.ensureQueryData(categoriesQueryOptions(getAuthToken)),
  ]);
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
  } else if (intent === "delete") {
    const id = formData.get("id") as string;

    const response = await fetch(`/api/activities/${id}`, {
      method: "DELETE",
      headers: { "x-auth-token": token },
    });

    if (!response.ok) {
      return { error: `HTTP error! status: ${response.status}` };
    }
  } else if (intent === "delete-all") {
    const response = await fetch("/api/activities", {
      method: "DELETE",
      headers: { "x-auth-token": token },
    });

    if (!response.ok) {
      return { error: `HTTP error! status: ${response.status}` };
    }
  } else {
    return { error: "Unknown intent" };
  }

  await queryClient.invalidateQueries({ queryKey: ["activities"] });
  await queryClient.invalidateQueries({ queryKey: ["activitiesWithLimit"] });

  return { ok: true };
}

export default function ActivityList() {
  return <ActivityListPage />;
}
