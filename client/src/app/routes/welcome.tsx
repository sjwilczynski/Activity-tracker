import { activitiesWithLimitQueryOptions } from "../../data/queryOptions";
import { Welcome as WelcomePage } from "../../pages/Welcome";
import { getLoadContext } from "../root";
import type { Route } from "./+types/welcome";

export async function clientLoader() {
  const { queryClient, getAuthToken } = getLoadContext();
  await queryClient.ensureQueryData(
    activitiesWithLimitQueryOptions(getAuthToken)
  );
  return null;
}

export async function clientAction({ request }: Route.ClientActionArgs) {
  const { queryClient, getAuthToken } = getLoadContext();
  const formData = await request.formData();
  const intent = formData.get("intent");

  if (intent === "add") {
    const activities = JSON.parse(formData.get("activities") as string);
    const token = await getAuthToken();

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

  return { error: "Unknown intent" };
}

export default function Welcome() {
  return <WelcomePage />;
}
