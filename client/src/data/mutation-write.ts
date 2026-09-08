import {
  mutationOptions,
  type QueryClient,
  type QueryKey,
} from "@tanstack/react-query";
import { apiFetch, type GetAuthToken } from "./apiClient";

export type MutationContext = {
  queryClient: QueryClient;
  getAuthToken: GetAuthToken;
};

export type WriteStep = {
  path: string;
  method: "POST" | "PUT" | "DELETE";
  body?: unknown;
  invalidates: readonly QueryKey[];
  failureContext?: string;
};

class WriteFailure extends Error {
  constructor(
    message: string,
    readonly refresh: readonly QueryKey[],
    readonly status?: number,
    options?: ErrorOptions
  ) {
    super(message, options);
    this.name = "WriteFailure";
  }
}

function affected(steps: readonly WriteStep[]) {
  const keys = new Map<string, QueryKey>();
  for (const step of steps) {
    for (const key of step.invalidates) keys.set(JSON.stringify(key), key);
  }
  return [...keys.values()];
}

async function write(
  getAuthToken: GetAuthToken,
  steps: readonly WriteStep[]
): Promise<void> {
  const completed: WriteStep[] = [];
  let attempted: WriteStep | undefined;
  try {
    for (const step of steps) {
      const token = await getAuthToken();
      attempted = step;
      const response = await apiFetch(async () => token, step.path, {
        method: step.method,
        ...(step.body !== undefined && {
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(step.body),
        }),
        allowNotOk: true,
      });
      attempted = undefined;
      if (response.ok || response.status === 409 || response.status >= 500) {
        completed.push(step);
      }
      if (!response.ok) {
        const message = response.status < 500 ? await response.text() : "";
        throw new WriteFailure(
          `${step.failureContext ?? ""}${message || `Request failed (status: ${response.status})`}`,
          affected(completed),
          response.status
        );
      }
    }
  } catch (error) {
    if (error instanceof WriteFailure) throw error;
    // An attempted write may have committed; a step awaiting auth never started.
    throw new WriteFailure(
      error instanceof Error ? error.message : "Request failed",
      affected(attempted ? [...completed, attempted] : completed),
      undefined,
      { cause: error }
    );
  }
}

export function writeMutationOptions<T>(
  { queryClient, getAuthToken }: MutationContext,
  key: string,
  plan: (variables: T) => readonly WriteStep[],
  successQueries: readonly QueryKey[]
) {
  const refresh = (keys: readonly QueryKey[]) =>
    Promise.all(
      keys.map((queryKey) => queryClient.invalidateQueries({ queryKey }))
    );

  return mutationOptions<void, Error & { status?: number }, T>({
    mutationKey: [key],
    mutationFn: (variables) => write(getAuthToken, plan(variables)),
    retry: false,
    onSuccess: async () => {
      await refresh(successQueries);
    },
    onError: async (error) => {
      if (error instanceof WriteFailure) await refresh(error.refresh);
    },
  });
}
