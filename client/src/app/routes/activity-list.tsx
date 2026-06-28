import { RouteErrorBoundary } from "../../components/states/RouteErrorBoundary";
import { apiFetch } from "../../data/apiClient";
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

  if (intent === "edit") {
    const id = formData.get("id") as string;
    const record = JSON.parse(formData.get("record") as string);

    const response = await apiFetch(getAuthToken, `/api/activities/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(record),
      allowNotOk: true,
    });

    if (!response.ok) {
      return { error: `HTTP error! status: ${response.status}` };
    }
  } else if (intent === "delete") {
    const id = formData.get("id") as string;

    const response = await apiFetch(getAuthToken, `/api/activities/${id}`, {
      method: "DELETE",
      allowNotOk: true,
    });

    if (!response.ok) {
      return { error: `HTTP error! status: ${response.status}` };
    }
  } else if (intent === "delete-all") {
    const response = await apiFetch(getAuthToken, "/api/activities", {
      method: "DELETE",
      allowNotOk: true,
    });

    if (!response.ok) {
      return { error: `HTTP error! status: ${response.status}` };
    }
  } else if (intent === "import") {
    const importData = JSON.parse(formData.get("importData") as string);

    const response = await apiFetch(getAuthToken, "/api/import", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(importData),
      allowNotOk: true,
    });

    if (!response.ok) {
      return { error: `HTTP error! status: ${response.status}` };
    }
  } else {
    return { error: "Unknown intent" };
  }

  const invalidations = [
    queryClient.invalidateQueries({ queryKey: ["activities"] }),
    queryClient.invalidateQueries({ queryKey: ["activitiesWithLimit"] }),
  ];

  if (intent === "import" || intent === "delete-all") {
    invalidations.push(
      queryClient.invalidateQueries({ queryKey: ["categories"] }),
      queryClient.invalidateQueries({ queryKey: ["preferences"] })
    );
  }

  await Promise.all(invalidations);

  return { ok: true };
}

export default function ActivityList() {
  return <ActivityListPage />;
}
