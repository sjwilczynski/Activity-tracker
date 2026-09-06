# Native TanStack mutations: assessment

**Conclusion:** `useMutation` is the idiomatic choice for this Query-backed SPA. TanStack Router explicitly does **not** manage mutation/submission state; it recommends external mutation tools, including Query. There is no missing Router-specific action API that we should use instead. TanStack Start server functions are a separate, unnecessary scope. [Router guidance][router]

The original proposal had the right ownership but left the final operation interface underspecified. The revised target is:

```text
validated form values -> typed operation variables -> useMutation
                                                    |
                                         shared HTTP/domain operation
                                                    |
                               Query lifecycle reconciles affected queries
                                                    |
                             mounted component resets/closes/navigates
```

See the [concrete example](../examples/tanstack-query-mutations.md) and [migration task 2](../plans/2026-09-06-tanstack-router-migration.md#2-decouple-mutations-without-changing-routers).

## What is native, and what is our policy?

| Decision                                                                    | Basis                                                                                                                                     |
| --------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| `useMutation` with a typed `mutationFn` and one variables object            | Native Query API. Resolve on acknowledged success; reject on failure.                                                                     |
| `mutationOptions` for sharing/inference, focused hook for injected services | Native helper, optional. It is not a mutation cache or a performance optimization itself.                                                 |
| Await affected `invalidateQueries` in hook/options callbacks                | Native lifecycle; our policy keeps save UI pending through active refresh settlement.                                                     |
| No blanket `router.invalidate()` for every write                            | Our data lives in Query, not loader return values. Router invalidation is for route-owned state, auth reevaluation, or boundary recovery. |
| Keep ordinary writes pessimistic; retain preference optimism                | App-specific UX choice, consistent with TkDodo's guidance against unnecessarily reproducing server logic.                                 |
| Partial/lost-acknowledgement writes refresh affected data even on error     | Existing app correctness contract, not something Query infers automatically.                                                              |

Sources: [mutations guide][mutations], [invalidation guide][invalidation], [Mastering Mutations][mastering], [published mutationOptions][options-source].

## The important correction: don't carry route actions into the final API

Confirmed again on merged main `0af2a70` (#1175): `client/src/data/actions.ts` exposes `runAction(request, context, route)`. It parses `Request.formData()`, passes a route/intent pair to `action-plan.ts`, executes ordered steps, and invalidates in `finally`. This already shares production/Storybook behavior, but is not the final typed mutation interface.

Reuse those HTTP steps, validation, errors, and invalidation decisions. Extract typed entry points beneath the adapter, such as `addActivities(records)` and `renameActivity({ oldName, newName, merge, targetCategoryId })`. Leave Request/FormData decoding and route allowlists only in temporary React Router adapters.

Do not implement `useMutation(() => runAction(new Request(...), ..., "welcome"))` as the destination architecture. FormData itself is fine for real multipart uploads; the unnecessary part is recreating a route submission protocol for our JSON API.

During conversion, an adapter around the existing executor can temporarily remain the only invalidation owner. Once reconciliation moves to Query callbacks, remove it from that executor in the same change and make old route adapters call the same reconciliation policy. Do not invalidate in both places.

## Efficiency and accurate pending state

Query matches query-key prefixes. Invalidation marks matching cache entries stale and normally refetches **active** observers only, not every retained variant. Invalidate the full-history and limited-history families together with `Promise.all`, rather than sequential awaits or a blanket cache flush. Keep finite freshness on observers; disabled/static observers do not automatically refetch. [Published QueryClient][client-source]

Returning an invalidation promise from `onSuccess` keeps `isPending` true until it settles. The required cache callback belongs in mutation options, not the per-call `mutate(..., { onSuccess })` callback: per-call callbacks can disappear on unmount or be replaced by a subsequent submission. Query's mutation callbacks still run when a component unmounts. [Guide][mutations], [execution source][mutation-source], [observer source][observer-source]

**Settlement is not a guarantee of fresh data.** Invalidation does not reject on refetch errors by default, and paused/disabled/inactive queries are not a blocking freshness guarantee. Preserve that distinction: an acknowledged save followed by a failed refresh is "saved, refresh failed", not "save failed, repeat POST". Surface the Query error with retry for the read, without replaying the write.

Do not opt into `throwOnError: true` for invalidation inside `onSuccess` casually. A thrown lifecycle callback can move a successfully committed mutation into Query's error path. The write itself is not retried just because a callback threw, but misleading error UI could cause a user to submit it again. [Execution source][mutation-source]

Global `MutationCache` invalidation is possible but not necessary here. Our operation groups have different effects and partial outcomes; explicit reusable options are clearer than a universal invalidate-everything rule. A query key and a mutation key with similar spelling are not automatically linked. [Mastering Mutations][mastering]

## Failure and multi-step operations

Preserve #1175's policy: refresh effects of completed steps, conflicts that indicate stale state, potentially committed server failures, and requests with a lost acknowledgement. Do not refresh for an unstarted step or an ordinary pre-write validation failure.

Communicate required reconciliation inside the mutation module: private receipts or typed failures can carry variable effects between HTTP steps and native callbacks. Simple fixed-success effects need no receipt. The public hook/options interface exposes typed variables and domain results or void, not cache keys or executor injection. This keeps application policy local without inventing a generic action framework.

Execute multi-step writes in their required order. `Promise.all` is appropriate for independent **read refreshes**, not deleting a category concurrently with the reassign/delete step it depends on. Keep errors that identify partial completion; do not claim transactional rollback for separate HTTP requests.

At inspected #1175 head, `delete-all` affects only activity query families; import affects activities/categories/preferences. The initial plan grouped these too broadly. Preserve this more precise operation policy rather than issuing unnecessary category/preference refreshes.

## Forms, callbacks, and resetting

Default to `mutate` for click handlers and forms already using mutation state as their submission authority. It returns void, so `await mutate(...)` does not wait. Continue to disable submission from `mutation.isPending`; do not treat Form's `isSubmitSuccessful` as server acknowledgement with this wiring.

Use `mutateAsync` when the caller actually needs a promise, including a TanStack Form `async onSubmit` that must track the complete request. Let failures propagate through Form's submission lifecycle, and handle the resulting `handleSubmit()` rejection at the UI event seam with visible error feedback. Catching inside `onSubmit` and returning normally can make Form report a failed request as successful. [Query guide][mutations], [Form 1.33.5 source][form-source]

Put required reconciliation in hook/options callbacks; component-local success callbacks own closing a dialog, resetting its form, and navigating. Keep them synchronous unless their promises are explicitly handled. Prevent duplicate success toasts by choosing either per-call callbacks or the existing `useFeedbackToast` observer, not both.

Mutation state is not shared like query data. Use `useIsMutating`/`useMutationState` for a cross-component view when needed. Reset completed mutation state when reopening an editor or changing its target; `reset()` does not cancel an in-flight request. Do not clear the entire mutation cache on every navigation. [Observer source][observer-source], [Mastering Mutations][mastering]

## Concurrency and optimism

`mutationKey` labels operations for defaults/filtering; it does not deduplicate requests, serialize writes, or provide a shared pending result. Default mutations run concurrently and do not retry failures. Preserve no automatic write retries, especially for additive/import/multi-step operations without idempotency guarantees. [Guide][mutations]

`scope: { id }` serializes mutation execution within the same QueryClient. Use it only for related writes where ordering is required, not as an app-wide queue. It queues duplicates rather than preventing them; pending buttons and form submission guards remain necessary.

**Scope alone does not make optimistic updates safe:** the published implementation runs `onMutate` before awaiting the queued retryer. Multiple queued optimistic callbacks can already have changed the cache. An old snapshot rollback or early refresh can overwrite newer intentions. [Execution source][mutation-source], [concurrency discussion][concurrency]

Existing preferences use full-document PUTs, multiple hook instances, and snapshot rollback; reviewed main already awaits settled invalidation. Cover affected overlap/failure scenarios before changing the module, and repair migration-related or introduced races. A scoped patch-based implementation is one possible remedy, not a required redesign before a problem is reproduced. Preserve immediate feedback and subsequent user intent; do not automatically expand the Router migration to unrelated preference work.

Do not implement that machinery for every activity/category mutation. Do not silently drop quick toggles or disable all settings as an unapproved shortcut. Also do not copy `isMutating() === 1` into every callback: skipping refresh is safe only when a later related operation is guaranteed to reconcile the same effects, including failures.

## Version update

**Updated 17:41 CEST:** #1177 merged as `8bf0b940d240ec04023c66d0eda7def7ded7f928`, providing Query/devtools **5.102.8** and Form **1.33.5**. Preserve its direct read-API migration and route regressions. Only the unrevised local documentation checkout still uses Query 5.90.21; implementation should start from refreshed main. This update does not authorize full implementation.

`mutationOptions`, `useMutation`, and the callback pattern above exist in both the inspected old and target packages. The read-side API does change: 5.102.8 introduces `queryClient.query` and deprecates `fetchQuery`/`prefetchQuery`/`ensureQueryData`. Reuse the modernization PR's behavior-preserving migration rather than duplicate it. [Old helper][old-options], [target QueryClient][client-source]

The conclusions concern API semantics and architecture, not measured network latency. The assessment itself preceded implementation. After the user's 20:07 authorization, native mutation hooks and the focused preference rollback/session-lifetime fix were implemented; see the [completed migration evidence](../plans/2026-09-06-tanstack-router-migration.md#implementation-evidence).

**Whole-plan review:** the updated example hides HTTP/effect seams behind the mutation module and uses real operation policy in tests. Reuse merged `actions.test.ts`, `action-effects.test.ts`, `action-policy.test.ts`, data-integrity stories and shared validators. Replace adapter-specific coverage only when equivalent behavior is covered at the new interface; do not layer mocks of the implementation underneath those assertions.

[router]: https://tanstack.com/router/latest/docs/guide/data-mutations
[mutations]: https://tanstack.com/query/v5/docs/framework/react/guides/mutations
[invalidation]: https://tanstack.com/query/v5/docs/framework/react/guides/invalidations-from-mutations
[mastering]: https://tkdodo.eu/blog/mastering-mutations-in-react-query
[concurrency]: https://tkdodo.eu/blog/concurrent-optimistic-updates-in-react-query
[options-source]: https://cdn.jsdelivr.net/npm/@tanstack/react-query@5.102.8/src/mutationOptions.ts
[old-options]: https://cdn.jsdelivr.net/npm/@tanstack/react-query@5.90.21/src/mutationOptions.ts
[client-source]: https://cdn.jsdelivr.net/npm/@tanstack/query-core@5.102.8/src/queryClient.ts
[mutation-source]: https://cdn.jsdelivr.net/npm/@tanstack/query-core@5.102.8/src/mutation.ts
[observer-source]: https://cdn.jsdelivr.net/npm/@tanstack/query-core@5.102.8/src/mutationObserver.ts
[form-source]: https://cdn.jsdelivr.net/npm/@tanstack/form-core@1.33.5/src/FormApi.ts
