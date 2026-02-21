import { RouteErrorBoundary } from "../../components/states/RouteErrorBoundary";
import {
  activitiesQueryOptions,
  categoriesQueryOptions,
} from "../../data/queryOptions";
import { Settings as SettingsPage } from "../../pages/Settings";
import { getLoadContext } from "../root";
import type { Route } from "./+types/settings";

export { RouteErrorBoundary as ErrorBoundary };

export async function clientLoader() {
  const { queryClient, getAuthToken, authService } = getLoadContext();
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

  if (intent === "add-category") {
    const category = JSON.parse(formData.get("category") as string);

    const response = await fetch("/api/categories", {
      method: "POST",
      headers: {
        "x-auth-token": token,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(category),
    });

    if (!response.ok) {
      return { error: `HTTP error! status: ${response.status}` };
    }
  } else if (intent === "edit-category") {
    const id = formData.get("id") as string;
    const category = JSON.parse(formData.get("category") as string);

    const response = await fetch(`/api/categories/${id}`, {
      method: "PUT",
      headers: {
        "x-auth-token": token,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(category),
    });

    if (!response.ok) {
      return { error: `HTTP error! status: ${response.status}` };
    }
  } else if (intent === "delete-category-with-activities") {
    const id = formData.get("id") as string;

    // First delete all activities in this category
    const deleteResponse = await fetch("/api/activities/delete-by-category", {
      method: "POST",
      headers: {
        "x-auth-token": token,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ categoryId: id }),
    });

    if (!deleteResponse.ok) {
      return {
        error: `Failed to delete activities (status: ${deleteResponse.status})`,
      };
    }

    // Then delete the category itself
    const catResponse = await fetch(`/api/categories/${id}`, {
      method: "DELETE",
      headers: { "x-auth-token": token },
    });

    if (!catResponse.ok) {
      return {
        error: `Activities deleted but failed to delete category (status: ${catResponse.status})`,
      };
    }
  } else if (intent === "delete-category-reassign") {
    const id = formData.get("id") as string;
    const targetCategoryId = formData.get("targetCategoryId") as string;

    // First reassign activities to target category
    const reassignResponse = await fetch("/api/activities/reassign-category", {
      method: "POST",
      headers: {
        "x-auth-token": token,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        fromCategoryId: id,
        toCategoryId: targetCategoryId,
      }),
    });

    if (!reassignResponse.ok) {
      return {
        error: `Failed to reassign activities (status: ${reassignResponse.status})`,
      };
    }

    // Then delete the category itself
    const catResponse = await fetch(`/api/categories/${id}`, {
      method: "DELETE",
      headers: { "x-auth-token": token },
    });

    if (!catResponse.ok) {
      return {
        error: `Activities reassigned but failed to delete category (status: ${catResponse.status})`,
      };
    }
  } else if (intent === "edit-activity") {
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
  } else if (intent === "rename-activity") {
    const oldName = formData.get("oldName") as string;
    const newName = formData.get("newName") as string;

    const response = await fetch("/api/activities/rename", {
      method: "POST",
      headers: {
        "x-auth-token": token,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ oldName, newName }),
    });

    if (!response.ok) {
      return { error: `HTTP error! status: ${response.status}` };
    }
  } else if (intent === "assign-category") {
    const activityName = formData.get("activityName") as string;
    const categoryId = formData.get("categoryId") as string;

    const response = await fetch("/api/activities/assign-category", {
      method: "POST",
      headers: {
        "x-auth-token": token,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ activityName, categoryId }),
    });

    if (!response.ok) {
      return { error: `HTTP error! status: ${response.status}` };
    }
  } else {
    return { error: "Unknown intent" };
  }

  await queryClient.invalidateQueries({ queryKey: ["categories"] });
  await queryClient.invalidateQueries({ queryKey: ["activities"] });
  await queryClient.invalidateQueries({ queryKey: ["activitiesWithLimit"] });

  return { ok: true };
}

export default function Settings() {
  return <SettingsPage />;
}
