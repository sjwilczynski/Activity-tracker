# TanStack Router: recommendation and evidence

**Decision accepted and implemented:** file-based TanStack Router while retaining the SPA, URLs, Azure Functions, Firebase, and Query. The user authorized implementation at 20:07 CEST on 2026-09-06; the worktree was fast-forwarded to `89ea859` (#1178). This research records the earlier observations and isolated proof; the [plan's implementation evidence](../plans/2026-09-06-tanstack-router-migration.md#implementation-evidence) records the completed workspace migration and remaining deployment checks.

**Recommendation:** worthwhile for this app's long-term maintainability, especially typed URL state and keeping route prefetches aligned with Query consumers. It is not necessary just to use Query, and it is not an automatic performance upgrade.

Read next: [query integration example](../examples/tanstack-router-query.md), [native mutation assessment](2026-09-06-tanstack-mutations.md), [mutation example](../examples/tanstack-query-mutations.md), and [implementation plan](../plans/2026-09-06-tanstack-router-migration.md).

## What all four posts contribute

The series links were followed from the first article's HTML, including links omitted by the simplified page renderer. Summaries below are original, not reproductions of the articles.

| Post                                                                                                                                          | Main idea                                                                                                                                                                                   | Application here                                                                                                                                                      |
| --------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1. [The Beauty of TanStack Router](https://tkdodo.eu/blog/the-beauty-of-tan-stack-router), May 25, 2025                                       | Type-safe navigation, validated search state, narrow subscriptions, file routing, and Suspense integration work together.                                                                   | Typed sidebar destinations and filters; route-level pending/error UI; generated route tree rather than handwritten route registration.                                |
| 2. [Context Inheritance in TanStack Router](https://tkdodo.eu/blog/context-inheritance-in-tan-stack-router), October 12, 2025                 | Parsed params, validated search, and context accumulate through the route hierarchy, including their inferred types.                                                                        | A pathless protected parent supplies services, shared search state, and query options without repeating auth setup in each child loader.                              |
| 3. [TanStack Router and Query](https://tkdodo.eu/blog/tan-stack-router-and-query), May 26, 2026                                               | Router decides when to initiate fetching; Query owns reusable server data and reactive subscriptions. Treat loaders as cache-warming events, not a second data store.                       | Keep our shared activities/categories/preferences cache. Start independent requests before rendering; consume them with Query hooks, not `useLoaderData`.             |
| 4. [Reliable Query Prefetching with TanStack Router](https://tkdodo.eu/blog/reliable-query-prefetching-with-tanstack-router), August 18, 2026 | Shared factories alone do not stop loader/component arguments drifting. Construct query options once in the route's synchronous `context` callback and consume that context in both places. | Make the options used for loading identical to those observed by pages, forms, and heatmap. Add `loaderDeps` only for URL state that actually changes a server query. |

### The important progression

Post 1 explains the router's developer experience. Post 2 establishes typed inheritance. Post 3 combines routing with Query's cache and observers. Post 4 removes a maintenance hazard in that combination.

The fourth post's motivating bug is subtle: a component starts using a new URL filter in its query key, while its loader still prefetches the unfiltered query. The page remains functionally correct but performs an unnecessary request followed by a second, sequential request.

Its solution is this data flow:

```text
validated search -> loaderDeps ----+
parsed path params ---------------+-> route context -> concrete query options
                                                        |             |
                                                     loader       Query hook
```

This is specifically the synchronous route `context` option, not simply "put QueryClient in context," and not a `beforeLoad` that constructs fresh options on every navigation. The context callback should derive options without fetching or reading mutable auth state. The fourth post describes reuse when params/deps are unchanged; auth changes still need an explicit lifecycle strategy.

The upstream [context types and implementation][context-source], [published Router core types](https://unpkg.com/@tanstack/router-core@1.171.27/src/route.ts), and [context tests][context-tests] confirm the API. The general context guide emphasizes `beforeLoad` and does not fully document this newer use; it must not be substituted without acknowledging the different lifecycle.

## What our app already does well

Initial application-analysis baseline: `c1cb468`. Review followed main through #1175/#1176 and #1177; implementation began after fast-forwarding to #1178 at `89ea859`. Tables describing old routes/actions are historical, not claims that those files still exist.

We already use React Router framework mode with `ssr: false`, route-level loaders/actions, generated route types, a shared QueryClient, shared query option factories, and Query observers in components. Global query `staleTime` and `gcTime` are both ten minutes; preferences use infinite stale time.

React Router can already coordinate Query fetching. TkDodo explicitly links his [React Query Meets React Router](https://tkdodo.eu/blog/react-query-meets-react-router) article from post 3. Moving libraries is not a prerequisite for deduplication, invalidation, or early loading.

### Concrete migration opportunities

| Current surface                                      | Observation                                                                                                          | Improvement enabled by the proposal                                                                                               |
| ---------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| `app/routes/_layout.tsx` and five page loaders       | Each child repeats `waitForAuth()` because current loaders run in parallel.                                          | A protected `beforeLoad` gates descendant loading; retain backend authorization.                                                  |
| `routes/welcome.tsx` versus `pages/Welcome.tsx`      | Loader warms recent activities only. Page also requests categories and full history; heatmap uses history too.       | Start all three before rendering. Keep full-history stats/heatmap non-blocking rather than delaying the whole dashboard.          |
| `DateFilterForm/shared.ts`, `pages/Compare.tsx`      | URL values are manually parsed and serialized in components.                                                         | Centralize validated, typed search contracts while retaining existing wire formats.                                               |
| `AppSidebar.tsx`                                     | Links preserve the whole current search string across sections.                                                      | Typed links and explicit search preservation, with existing behavior covered before changing it.                                  |
| Three action modules and many `useFetcher` consumers | Forms are coupled to route URLs/intent dispatch even though they already use TanStack Form.                          | Typed Query mutations backed by shared domain operations, not a new generic action framework.                                     |
| `.storybook/preview.ts`, `mocks/actionRouting.ts`    | Initial baseline duplicated actions; merged #1175 now shares `runAction` with production, plus a QueryClient bridge. | Preserve that real behavior while replacing the router adapter; exercise real mutation hooks and mock HTTP, not operation policy. |

## Benefits, costs, and alternatives

**Strongest benefits:** end-to-end typed destinations/search, inferred parent context, a clear route-options contract shared with Query consumers, built-in intent preloading, and route-aware subscriptions. File routing and automatic splitting make it easier to keep loading logic available before heavyweight page chunks. These are capabilities, not benchmark results. [Sources: posts 1-4; [Vite setup][vite], [data loading][loading], [search params][search], [authenticated routes](https://tanstack.com/router/latest/docs/guide/authenticated-routes).]

**Moderate benefit today:** path-param typing and deeply nested context. This app has only seven concrete URLs, no current dynamic URL segments, and a shallow route tree. Avoid justifying the migration using complexity we do not have.

**Real costs:** replacing framework bootstrapping, mutation/action semantics, Storybook integration, and URL handling. New route generation and type inference add tooling requirements. Intent preloads can increase unused API work. Incorrect cache/auth coordination can leak stale account data or create fetch waterfalls. The official [migration checklist][migration] is useful but insufficient for our framework-mode setup.

**Not automatic benefits:** a smaller bundle, faster rendering everywhere, better accessibility, backend type safety, SEO, or SSR. Router itself does not add runtime validation of our API responses. TanStack Start is a separate scope; its server rendering/streaming capabilities are not part of this proposal.

| Alternative                                     | Assessment                                                                                                                                                                          |
| ----------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Keep React Router and improve Query integration | Lowest migration risk. Can fix dashboard prefetches, mutation reuse, and shared factory discipline now. Does not provide the same integrated typed search/navigation/context model. |
| Code-based TanStack Router                      | Same router capabilities, explicit tree, no file generator required. User chose file-based routing for discoverability and automatic splitting.                                     |
| File-based TanStack Router, still an SPA        | Recommended, approved scope. Keep existing URLs and backend; use one router after cutover.                                                                                          |
| TanStack Start                                  | Unnecessary here. Introduces server execution/deployment questions and cannot be justified merely by wanting Router + Query integration.                                            |

## Loading and freshness: avoid misleading shortcuts

The following records the **initial pinned `@tanstack/react-query@5.90.21`** baseline, which depends on `@tanstack/query-core@5.90.20`. Semantics were checked in the [published source][query-source], not inferred from a floating documentation URL. See the 5.102.8 adaptation below for the now-merged #1177 API.

| Operation                                                  | Missing cache                    | Existing cache                                                                   | Errors / use                                                                                                                 |
| ---------------------------------------------------------- | -------------------------------- | -------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| `ensureQueryData(options)`                                 | Fetches and returns its promise. | Returns cached data, even stale/invalidated data; no freshness check by default. | Missing-data failure rejects. Suitable for "must have something" loaders.                                                    |
| `ensureQueryData({ ...options, revalidateIfStale: true })` | Fetches.                         | Returns cached data immediately and starts a stale refresh.                      | Background prefetch failure stays in Query state.                                                                            |
| `fetchQuery(options)`                                      | Fetches.                         | Uses fresh data; waits for a fetch when stale/invalidated.                       | Rejects on failure. Await only when fresh data is required before proceeding.                                                |
| `prefetchQuery(options)`                                   | Starts a fetch.                  | Uses Query's stale-time policy, fetching if stale.                               | Returns `Promise<void>` and does not reject on query failure. Consumers must observe/report errors.                          |
| `useSuspenseQuery(options)`                                | Suspends for missing data.       | Observes cached data and updates.                                                | Missing-data errors reach the boundary; a background refresh error with cached data does not automatically replace the page. |
| `useQuery(options)`                                        | Returns loading state.           | Observes cached data and updates.                                                | Appropriate for optional panels and explicit inline loading/error UI.                                                        |

Configure `defaultPreload: "intent"` and `defaultPreloadStaleTime: 0` on Router. The latter removes the default 30-second _preload freshness shortcut_ so Query can decide freshness. It does **not** disable all Router caching, change Query's ten-minute stale time, or guarantee a loader call for every event: in-flight work can be shared and `shouldReload` can suppress calls. Keep normal Router stale time at zero and do not add `shouldReload: false` indiscriminately. [Source: [loading guide][loading].]

Returning query data from loaders and rendering it via `useLoaderData` would bypass Query observers. That loses automatic active-query refetch behavior and lets Query consider data unused. Our loaders should return no server data; our components should observe Query. [Source: post 3.]

For the dashboard, start all needed prefetches without awaiting them; use Suspense for recent activities/categories and regular Query for full-history panels. This is post 3's scheduling choice combined with post 4's shared-options contract. For existing pages that currently await critical queries, retain that policy initially using the same context options.

Fine-grained subscriptions are useful, but do not claim every selector is structurally shared by default. The [render guide][render] distinguishes URL-state sharing from selector-result sharing. Query options contain functions; do not enable JSON structural sharing globally and expect it to stabilize those objects. Subscribe to the existing context option object instead.

## Versions and sequencing

**Updated September 6, 2026, 13:39 CEST:** #1176 squash-merged as [`388cf92`](https://github.com/sjwilczynski/Activity-tracker/commit/388cf92ecb14669a830fab8650b7bccff7a4a740). Its manifest includes React Router `^8.3.1`, Vite `^8.2.2`, TypeScript `7.0.2`, Storybook 10.6, and Tailwind 4.3.3. Query stays at `5.90.21`. Rebase the implementation on that merged toolchain rather than transplanting the initial Vite 7 configuration.

The merged integration uses the native Oxc React Compiler in `client/vite/react-compiler.ts`, native/type-aware Oxlint and Oxfmt, and raw `tsc --noEmit` gates in CI/build scripts. Preserve these gates when replacing framework typegen/build commands. #1176 set the named `Client JavaScript` budget to 355 kB; **#1177 supersedes it with 360 kB**.

The npm registry returned Router `1.170.32` and router-plugin `1.168.35`; the plugin declares Router `^1.170.32` and Vite 5/6/7/8 compatibility. Package version numbers are not all identical. These are candidate pins, not proof that our build and React Compiler configuration are compatible. Recheck resolved peers and run the post-#1176 pipeline in the implementation spike. [Sources: [Router manifest][router-package], [plugin manifest][plugin-package].]

**Version-specific documentation:** both `query/latest` and `query/v5` QueryClient pages returned `queryClient.query` during research. That API is not in our initial 5.90.21 baseline but is present in the now-merged 5.102.8 version. Use the published source for the installed version rather than assuming all v5 minors expose identical APIs.

#1175 has now merged as [`0af2a70`](https://github.com/sjwilczynski/Activity-tracker/commit/0af2a70304ddf53c994cfeefc9d8a7a98c98818d). It adds shared `actions.ts`/`action-plan.ts`, behavior-focused action/effect/policy coverage, shared backup/name validation, and real production/Storybook orchestration. The plan must preserve these, not redo the old action extraction. Current main also returns the preference mutation's settled invalidation promise.

**Historical update, 17:41 CEST:** #1177 merged as [`8bf0b94`](https://github.com/sjwilczynski/Activity-tracker/commit/8bf0b940d240ec04023c66d0eda7def7ded7f928), supplying Query/devtools 5.102.8 and the other client upgrades. Router implementation was still unauthorized then; authorization followed at 20:07, after #1178's further updates. The workspace migration preserves both PRs.

### Query 5.102.8 adaptation

The [published target QueryClient](https://cdn.jsdelivr.net/npm/@tanstack/query-core@5.102.8/src/queryClient.ts) deprecates the three imperative methods above in favor of `query`. For our current factories, which do not define `select`:

| Baseline operation                              | Target behavior                                                                                                                                   |
| ----------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| `fetchQuery(options)`                           | `query(options)`: use fresh cache or fetch; reject on error.                                                                                      |
| `ensureQueryData(options)` without revalidation | `query({ ...options, staleTime: "static" })`: use any cached value, including invalidated data; fetch when missing.                               |
| Fire-and-forget `prefetchQuery(options)`        | Start `query(options)` with an explicit rejection handler; errors remain in Query state for consumers. Do not leave a rejected promise unhandled. |

Apply `"static"` only at the imperative call, never to the shared options consumed by observers: static observers would prevent the normal invalidation/refetch behavior mutations depend on. `Infinity` is not equivalent to `"static"` because invalidation still makes infinite-stale-time data stale. Keep preference observer `staleTime: Infinity`.

If `revalidateIfStale: true` is introduced later, it needs a distinct background-refresh policy, not a mechanical static replacement. Reuse #1177's direct calls and `client-loaders.test.ts` / `_layout.test.ts` coverage rather than add a helper. The query example targets merged main, not the untouched old documentation checkout.

## Whole-plan design review

The [reviewed plan](../plans/2026-09-06-tanstack-router-migration.md) uses smaller interfaces for session lifetime and mutation policy, keeps receipts/transport seams internal, and places behavior coverage before each affected refactor. It explicitly handles test-file exclusion and real authenticated route context in Storybook. Fix migration-related or introduced issues, including affected preference races; unrelated speculative redesign is not automatically in scope.

The isolated session-runtime/compiler proof below established feasibility before implementation. The user subsequently gave the required authorization at 20:07 CEST; the proof's versions/results remain historical and are not relabeled as full-app evidence.

## Isolated proof results

**Completed September 6, 2026.** The user approved testing three seams in isolation: session lifetime, generated Router/Query context, and the actual Vite/Oxc/Storybook pipeline. Only auth and HTTP are mocked. All executable spike files and installed dependencies live in session artifacts, not the app worktree.

| Proof surface        | Observed result                                                                                                                                                                                                  |
| -------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Token lifetime       | Retired sessions reject before acquiring another account's token and after a token await crosses an identity change.                                                                                             |
| Auth/runtime         | No private fetch before initialization; one required query after resolution under StrictMode; mock login retains deep-link search.                                                                               |
| Identity transitions | Same UID preserves cache; account switch/logout remove the prior view; late old reads/writes do not affect the next account. Cleanup/restart removes external subscriptions without destroying injected history. |
| Generated context    | Loader and Query consumer use the same typed options; fetch-related search changes select the correct query; display-only search does not refetch. Colocated test files are excluded.                            |
| TypeScript           | Raw TS 7 typecheck passes; `@ts-expect-error` assertions confirm rejection of nonexistent destinations and string values for numeric search.                                                                     |
| Native compiler      | The four unchanged `client/vite/react-compiler.test.ts` cases pass. Built dashboard/login chunks contain compiler memoization.                                                                                   |
| Browser harness      | Five real Chromium Storybook stories pass; full suite is 13 cases across five files, including a cold-cache run.                                                                                                 |
| Build/runtime        | Both split-route Vite SPA and static Storybook build. Chromium executes the built SPA and its dynamic dashboard chunk, including deep-link reload/login/search.                                                  |

**Versions:** main source `0af2a70`; Node 22.22.0 (fixture-local, since the shell's default is Node 18), Bun 1.4.2, React/DOM 19.2.8, Router 1.170.32, router-plugin 1.168.35, router-cli 1.167.33, Query 5.102.8, Vite 8.2.2, TypeScript 7.0.2, Oxc 0.145.0, Storybook 10.6.0, Vitest 4.1.11, Playwright 1.63.0. Exact resolutions are preserved in the fixture's lockfile.

**Actionable finding:** the first real browser integration run failed when Vite discovered Query/Zod through a split route, reoptimized, and invalidated a Storybook dynamic import mid-test. Adding `optimizeDeps.include` for Query, Router, and Zod fixed it. The complete suite then passed with only the fixture's Vite/Storybook caches removed, ruling out a warm-cache-only success.

**Other lessons:** token retrieval must reject asynchronously and recheck identity after awaiting. Raw TypeScript caught an unsupported `exact` option on a role query even though browser behavior passed, confirming why build/typecheck gates must remain separate. The CLI emits a non-failing router-core CommonJS `replaceRouteChunk` circular-import warning; Storybook warns about a large preview chunk. Neither was hidden.

**Reproduce:** unpack the session artifact `tanstack-router-proof.tar.gz` and run `bash router-proof/run-proof.sh`. The fixture is retained at:

```text
/home/stachu/.copilot/session-state/c5e7eb1c-8f7c-4184-ba32-723ad89796b2/files/router-proof
```

Its `evidence/` directory contains cold/warm test logs, build logs, manifest, built-SPA smoke results, and a screenshot. The smoke temporarily uses `127.0.0.1:4317` and closes its browser/server; no long-running proof server is left behind.

**Limits:** this is not live Firebase authentication or token-expiry testing, a full migration of the app's forms/styles/charts, complete mutation/backup/rename coverage, Azure/PWA verification, or a production bundle measurement. The mutation and mock login in the fixture are lifecycle tracers, not production replacements. Cancellation is not rollback of a server-committed write.

Merged #1177 confirms no read helper is required: required reads use a local `"static"` override, optional preferences handle rejection while retaining Query errors, and shared observer freshness stays unchanged. Preserve its route regressions. The archived proof remains an exact historical artifact: it used MSW 2.12.7/addon 2.0.6, not #1177's newer pair, and did not exercise the newly upgraded Form/Radix/date-fns application surfaces. Re-run affected harness/app cases on refreshed main during authorized implementation; do not relabel the prior proof as that run.

## Evidence and limits

Initial local findings are historical observations, not claims that every issue remains on updated main. The review supersedes stale baseline assumptions as described above. No timing or bundle improvement has been measured. No application dependencies or runtime code were changed.

For reproducible PR inspection, use `gh api repos/sjwilczynski/Activity-tracker/pulls/<number>/files` with filename filtering: `gh pr diff` does not accept git-style file pathspecs after the PR argument.

[vite]: https://tanstack.com/router/latest/docs/installation/with-vite
[loading]: https://tanstack.com/router/latest/docs/guide/data-loading
[search]: https://tanstack.com/router/latest/docs/guide/search-params
[render]: https://tanstack.com/router/latest/docs/guide/render-optimizations
[migration]: https://tanstack.com/router/latest/docs/installation/migrate-from-react-router
[context-source]: https://github.com/TanStack/router/blob/08eff50c447a154a3373909009e9e4375cea17ce/packages/router-core/src/route.ts
[context-tests]: https://github.com/TanStack/router/blob/08eff50c447a154a3373909009e9e4375cea17ce/packages/react-router/tests/routeContext.test.tsx
[query-source]: https://unpkg.com/@tanstack/query-core@5.90.20/src/queryClient.ts
[router-package]: https://registry.npmjs.org/@tanstack/react-router/1.170.32
[plugin-package]: https://registry.npmjs.org/@tanstack/router-plugin/1.168.35
