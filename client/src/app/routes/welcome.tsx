import { RouteErrorBoundary } from "../../components/states/RouteErrorBoundary";
import { activitiesWithLimitQueryOptions } from "../../data/queryOptions";
import { Welcome as WelcomePage } from "../../pages/Welcome";
import { getLoadContext } from "../root";
import type { Route } from "./+types/welcome";

export { RouteErrorBoundary as ErrorBoundary };

export async function clientLoader() {
  const { queryClient, getAuthToken, authService } = getLoadContext();
  // Wait for auth to initialize (loaders run in parallel, so parent's waitForAuth may not have completed)
  await authService.waitForAuth();
  await queryClient.ensureQueryData(
    activitiesWithLimitQueryOptions(getAuthToken)
  );
  return null;
}

export async function clientAction({ request }: Route.ClientActionArgs) {
  const { queryClient, getAuthToken } = getLoadContext();
  const formData = await request.formData();
  const intent = formData.get("intent");
  const token = await getAuthToken();

  if (intent === "add") {
    const activities = JSON.parse(formData.get("activities") as string);

    const response = await fetch("/api/activities", {
      method: "POST",
      headers: {
        "x-auth-token": token,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(activities),
    });

    if (!response.ok) {
      return { error: `HTTP error! status: ${response.status}` };
    }

    await queryClient.invalidateQueries({ queryKey: ["activities"] });
    await queryClient.invalidateQueries({ queryKey: ["activitiesWithLimit"] });

    return { ok: true };
  }

  if (intent === "import") {
    const importData = JSON.parse(formData.get("importData") as string);

    const response = await fetch("/api/import", {
      method: "POST",
      headers: {
        "x-auth-token": token,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(importData),
    });

    if (!response.ok) {
      return { error: `HTTP error! status: ${response.status}` };
    }

    await queryClient.invalidateQueries({ queryKey: ["activities"] });
    await queryClient.invalidateQueries({ queryKey: ["activitiesWithLimit"] });
    await queryClient.invalidateQueries({ queryKey: ["categories"] });
    await queryClient.invalidateQueries({ queryKey: ["preferences"] });

    return { ok: true };
  }

  return { error: "Unknown intent" };
}

export default function Welcome() {
  return <WelcomePage />;
}
