# Activity Tracker: native Query mutations

**Design reference.** Implementation was authorized at 20:07 CEST and started from `89ea859` (#1178). Production now exposes native hooks in `client/src/data/mutations.ts`, reusable options in `actions.ts`, and private write/effect handling in `mutation-write.ts` / `action-plan.ts`. The illustrative names below explain the design rather than prescribe additional modules. See the [sourced assessment](../research/2026-09-06-tanstack-mutations.md).

Router has no action/fetcher system to adopt here. Query owns mutation state; typed operation functions own HTTP behavior. The route tree does not need mutation options in context just because it uses context for prefetched query options: mutations have no loader/component prefetch identity to coordinate.

## 1. A small interface with the policy inside

The mutation module's public interface is `useAddActivities()`: callers provide typed records and receive native Query mutation state. They do not inject operation executors, construct Requests, choose invalidation keys, or interpret effect receipts.

Inside the module, reuse merged `actions.ts` / `action-plan.ts` and `shared/` validation. Extract `addActivities(getAuthToken, records): Promise<void>` from that implementation; it posts the existing JSON array to `/api/activities` and rejects on failure. This example declares its use below, not a second HTTP implementation.

The following error is an **internal seam** between ordered HTTP steps and reconciliation, not a type forms must import:

```ts
// Proposed data/mutations/internal/write-failure.ts
import type { QueryKey } from "@tanstack/react-query";

export class WriteFailure extends Error {
  constructor(
    message: string,
    readonly refresh: readonly QueryKey[],
    readonly status?: number
  ) {
    super(message);
    this.name = "WriteFailure";
  }
}
```

Ordinary rejected validation has no refresh effects. A conflict, potentially committed server error, or lost acknowledgement throws `WriteFailure` with the effects requiring reconciliation. Preserve structured error details/cause where the existing contract supports them. Unexpected errors still reject; do not infer effects from message text.

Success effects for an add are fixed, so no receipt is necessary. Multi-step category operations may aggregate effects in private receipts/failures. Neither cache keys nor step ordering become part of the public interface; no generic command bus is needed.

## 2. One reconciliation owner, native mutation options

```ts
// Proposed data/mutations/useAddActivities.ts
import {
  mutationOptions,
  useMutation,
  useQueryClient,
  type QueryClient,
  type QueryKey,
} from "@tanstack/react-query";
import { useAuthContext } from "@/auth/AuthContext";
import type { GetAuthToken } from "@/data/apiClient";
import type { ActivityRecordServer } from "@/data/types";
import {
  getActivitiesQueryId,
  getActivitiesQueryIdWithLimit,
} from "@/data/react-query-config/query-constants";
import { addActivities } from "./internal/activity-operations";
import { WriteFailure } from "./internal/write-failure";

const activityQueries = [getActivitiesQueryId, getActivitiesQueryIdWithLimit];

async function refreshAffected(
  queryClient: QueryClient,
  keys: readonly QueryKey[]
) {
  await Promise.all(
    keys.map((queryKey) => queryClient.invalidateQueries({ queryKey }))
  );
}

function addActivitiesMutationOptions(
  getAuthToken: GetAuthToken,
  queryClient: QueryClient
) {
  return mutationOptions({
    mutationKey: ["activities", "add"],
    mutationFn: (records: ActivityRecordServer[]) =>
      addActivities(getAuthToken, records),
    retry: false,
    onSuccess: () => refreshAffected(queryClient, activityQueries),
    onError: (error) => {
      if (error instanceof WriteFailure) {
        return refreshAffected(queryClient, error.refresh);
      }
    },
  });
}

export function useAddActivities() {
  const { getIdToken } = useAuthContext();
  const queryClient = useQueryClient();
  if (!getIdToken)
    throw new Error("Activity mutations require an authenticated session");
  return useMutation(addActivitiesMutationOptions(getIdToken, queryClient));
}
```

The existing AuthContext gets its runtime-bound token function from the session runtime module, not from each caller. The QueryClient is the one provided above the app. The test adapters vary auth and HTTP, not the `addActivities` implementation under test.

`mutationOptions` is optional when options have no reuse; keeping the options literal directly in the hook is equally native. Keep `refreshAffected` with the existing private shared policy where adapters/hooks reuse it. Deduplicate private effects using canonical keys. Do not export internals just to test their structure.

The returned result has typed variables, `data: void`, and an Error-compatible failure. The `onError` branch adds required reconciliation, not a catch hiding unknown errors. Private cache metadata does not have to be learned by forms.

No invalidation remains inside the final HTTP executor, and no blanket global MutationCache or Router invalidation runs as well. If an intermediate adapter still calls `runAction`, **do not add these callbacks until its internal invalidation has been moved**.

## 3. Form use: mutation is the submission authority

This form adapter retains the existing outward state shape and earns its place by translating form values to wire records. It does not duplicate mutation policy:

```ts
// Proposed replacement useAddActivityFormSubmit.ts
import { format } from "date-fns";
import type { ActivityFormValues } from "../schemas";
import { useAddActivities } from "@/data/mutations/useAddActivities";

export function useAddActivityFormSubmit() {
  const mutation = useAddActivities();

  const onSubmit = (values: ActivityFormValues) => {
    mutation.mutate([
      {
        date: format(values.date, "yyyy-MM-dd"),
        name: values.category.name,
        categoryId: values.category.ca,,,,tegoryId,
      },
    ]);
  };

  return {
    onSubmit,
    isPending: mutation.isPending,
    isError: mutation.isError,
    isSuccess: mutation.isSuccess,
    error: mutation.error,
    reset: mutation.reset,
  };
}
```

The existing TanStack Form `onSubmit` can call this handler. Continue using `isPending` to disable save and `useFeedbackToast`/mutation success for reset/celebration. Here Form's `isSubmitting` covers validation/dispatch, **not** the HTTP lifecycle; do not use Form's success flag to decide that saving succeeded. `await mutation.mutate(...)` would not change that.

For a dialog that already uses `mutate` directly, per-call callbacks can do mounted-only UI work:

```ts
mutation.mutate(records, {
  onSuccess: () => closeRef.current?.click(),
});
```

The required cache effects remain in mutation options even if this component unmounts. Reset completed mutation state on a new edit/open cycle. Keep the existing self-contained DialogTrigger and restore focus; do not close on failed writes.

If Form must track the whole async submission instead, choose `onSubmit: ({ value }) => mutation.mutateAsync(toRecords(value))`. Let the failure reach Form so `isSubmitSuccessful` remains false, then handle the `form.handleSubmit()` rejection at the outer event boundary with visible feedback. Do not fire-and-forget that promise or catch-and-return success inside `onSubmit`. This is an alternative wiring, not a reason to keep two independent success/reset mechanisms.

## 4. What makes this effective?

For an activity add, invalidate `getActivitiesQueryId` and `getActivitiesQueryIdWithLimit`. Prefix matching covers all cached limits, but only active queries refetch by default. In a dashboard with recent activities and history active, these are two distinct legitimate requests; there is no category/preferences reload or full router reload.

The pending state includes the active refetch settlement because `onSuccess` returns its promise. If the write succeeds but the refresh fails, Query retains a query error: show "saved, refresh failed" with a read retry rather than offering to repeat the POST. Default invalidation does not throw on a read failure; do not silently change that inside a write callback.

Use direct `setQueryData` only when a response is authoritative for that specific cache entry. Our history is sorted/limited and includes server-derived fields, so don't manufacture a new history list, totals, heatmap, and category membership on the client just to avoid a refresh.

No automatic retries, broad cache flushing, universal optimistic layer, or serialized app-wide mutation queue are needed. `mutationKey` is a label, not deduplication. Ordinary pending controls prevent repeated submissions; operations for separate records can remain concurrent.

Preferences are the existing optimistic workflow; current main already awaits settled invalidation. Cover overlap/failure before changing it and fix migration-related problems, but do not prescribe a new queue/patch-overlay architecture without evidence. `scope.id` alone does not serialize `onMutate` or make snapshot rollback safe.

## 5. Regression contract before cutover

First preserve the merged `actions`, `action-effects`, `action-policy`, data-integrity and name/merge cases. Add missing affected cases before their refactor. Observe the public mutation interface with real orchestration and Query observers; stub HTTP/auth, not private operation functions. Keep adapter tests until the old adapter is removed.

| Case                                                       | Required result                                                                          |
| ---------------------------------------------------------- | ---------------------------------------------------------------------------------------- |
| Successful add                                             | One write; one refresh of each active affected family; unrelated families untouched.     |
| Cached inactive recent limits                              | Marked stale, not eagerly fetched; next observer refreshes according to Query policy.    |
| Component unmounts before response                         | Required cache reconciliation still runs; no stale dialog close/navigation.              |
| Validation rejected before write                           | Visible failure; no success/reset and no unnecessary refresh.                            |
| Conflict, lost acknowledgement, multi-step partial failure | Refresh the affected/completed subset; preserve failure and no automatic replay.         |
| Acknowledged write, failed read refresh                    | Do not represent it as an uncommitted write or suggest retrying POST.                    |
| Repeated submit/reopen                                     | No duplicate POST; completed mutation state reset without losing an in-flight operation. |
| Overlapping preference edits with one failure              | Later accepted user intent survives; no whole-document stale rollback.                   |
| Sign-out during mutation                                   | Retired runtime handles its own completion; no next-account token/cache/UI effects.      |
