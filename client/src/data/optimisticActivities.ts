import type { QueryClient, QueryKey } from "@tanstack/react-query";
import {
  getActivitiesQueryId,
  getActivitiesQueryIdWithLimit,
} from "./react-query-config/query-constants";
import type { ActivityRecordServer, ActivityRecordWithId } from "./types";

type ActivityList = ActivityRecordWithId[];

/** Pure transform applied to every cached activity list. */
type ActivityUpdater = (records: ActivityList) => ActivityList;

/**
 * Snapshot of the activity caches taken before an optimistic update so it can
 * be restored if the server request fails.
 */
type ActivitiesSnapshot = {
  activities: ActivityList | undefined;
  activitiesWithLimit: [QueryKey, ActivityList | undefined][];
};

/**
 * Optimistically apply `update` to the cached activity lists — both the full
 * `["activities"]` list and every `["activitiesWithLimit", limit]` variant —
 * and return a snapshot for rollback. In-flight refetches are cancelled first
 * so they cannot clobber the optimistic data (mirrors the `onMutate` step of
 * `useUpdatePreferences`).
 */
async function applyOptimisticActivityUpdate(
  queryClient: QueryClient,
  update: ActivityUpdater
): Promise<ActivitiesSnapshot> {
  await Promise.all([
    queryClient.cancelQueries({ queryKey: getActivitiesQueryId }),
    queryClient.cancelQueries({ queryKey: getActivitiesQueryIdWithLimit }),
  ]);

  const snapshot: ActivitiesSnapshot = {
    activities: queryClient.getQueryData<ActivityList>(getActivitiesQueryId),
    activitiesWithLimit: queryClient.getQueriesData<ActivityList>({
      queryKey: getActivitiesQueryIdWithLimit,
    }),
  };

  const apply = (records: ActivityList | undefined) =>
    records ? update(records) : records;

  queryClient.setQueryData<ActivityList>(getActivitiesQueryId, apply);
  queryClient.setQueriesData<ActivityList>(
    { queryKey: getActivitiesQueryIdWithLimit },
    apply
  );

  return snapshot;
}

/** Restore the activity caches captured by {@link applyOptimisticActivityUpdate}. */
function rollbackActivities(
  queryClient: QueryClient,
  snapshot: ActivitiesSnapshot
): void {
  queryClient.setQueryData(getActivitiesQueryId, snapshot.activities);
  for (const [queryKey, data] of snapshot.activitiesWithLimit) {
    queryClient.setQueryData(queryKey, data);
  }
}

/**
 * Run an activity mutation with optimistic UI: apply `update` to the caches,
 * perform the request, roll back on failure, and always invalidate so the
 * server stays the source of truth (the `onMutate`/`onError`/`onSettled`
 * lifecycle, adapted for react-router actions). Returns the route action's
 * `{ ok }`/`{ error }` shape; rethrows network errors after rolling back.
 */
export async function runOptimisticActivityMutation(
  queryClient: QueryClient,
  update: ActivityUpdater,
  performRequest: () => Promise<Response>
): Promise<{ ok: true } | { error: string }> {
  const snapshot = await applyOptimisticActivityUpdate(queryClient, update);

  try {
    const response = await performRequest();
    if (!response.ok) {
      rollbackActivities(queryClient, snapshot);
      return { error: `HTTP error! status: ${response.status}` };
    }
    return { ok: true };
  } catch (error) {
    rollbackActivities(queryClient, snapshot);
    throw error;
  } finally {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: getActivitiesQueryId }),
      queryClient.invalidateQueries({ queryKey: getActivitiesQueryIdWithLimit }),
    ]);
  }
}

/** Updater that removes the activity with the given id from a list. */
export const removeActivityById =
  (id: string): ActivityUpdater =>
  (records) =>
    records.filter((record) => record.id !== id);

/**
 * Updater that replaces the activity with the given id. The edit payload is an
 * {@link ActivityRecordServer} (string date, no `id`/`active`), so we convert
 * the date and carry over the existing `id` and `active` flag — the latter is
 * reconciled by the post-success invalidation.
 */
export const replaceActivityById =
  (id: string, record: ActivityRecordServer): ActivityUpdater =>
  (records) =>
    records.map((existing) =>
      existing.id === id
        ? {
            ...record,
            date: new Date(record.date),
            id: existing.id,
            active: existing.active,
          }
        : existing
    );
