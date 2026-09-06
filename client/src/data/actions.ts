import type { QueryClient, QueryKey } from "@tanstack/react-query";
import { mutationsFor, type ActionRoute } from "./action-plan";
import { apiFetch, type GetAuthToken } from "./apiClient";

export type { ActionRoute } from "./action-plan";

export type ActionContext = {
  queryClient: QueryClient;
  getAuthToken: GetAuthToken;
};

export type ActionResult =
  | { ok: true; error?: never; status?: never }
  | { error: string; status?: number; ok?: never };

/** Routes and Storybook share policies, ordered mutations, and their effects. */
export async function runAction(
  request: Request,
  { queryClient, getAuthToken }: ActionContext,
  route: ActionRoute
): Promise<ActionResult> {
  const mutations = mutationsFor(route, await request.formData());
  if (!mutations) return { error: "Unknown intent" };

  const invalidations = new Set<QueryKey>();
  let uncertainQueries: QueryKey[] = [];
  try {
    for (const mutation of mutations) {
      const token = await getAuthToken();
      uncertainQueries = mutation.invalidates;
      const response = await apiFetch(async () => token, mutation.path, {
        method: mutation.method,
        ...(mutation.body !== undefined && {
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(mutation.body),
        }),
        allowNotOk: true,
      });
      uncertainQueries = [];
      if (response.ok || response.status === 409 || response.status >= 500) {
        mutation.invalidates.forEach((key) => invalidations.add(key));
      }
      if (!response.ok) {
        const message = response.status < 500 ? await response.text() : "";
        return {
          error: `${mutation.failureContext ?? ""}${message || `Request failed (status: ${response.status})`}`,
          status: response.status,
        };
      }
    }
    return { ok: true };
  } finally {
    // A lost acknowledgement may follow a committed write; unstarted steps have no effects.
    uncertainQueries.forEach((key) => invalidations.add(key));
    await Promise.all(
      [...invalidations].map((queryKey) =>
        queryClient.invalidateQueries({ queryKey })
      )
    );
  }
}
