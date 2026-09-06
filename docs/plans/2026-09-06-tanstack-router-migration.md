# TanStack Router migration plan

**Status:** implemented in the workspace after explicit authorization at 20:07 CEST on 2026-09-06. Base: main `89ea859` (#1178). Not deployed; the numbered sections retain the reviewed implementation rationale and release requirements.

**Latest baseline:** #1178 adds MSW Storybook addon 3 (`mswLoader` from `/csf3` with an explicit worker factory), Firebase 12.18, Lucide 1.41, and newer tooling requiring Node >=22.22.1. Preserve these changes. Before migration edits, 87 affected action/loader unit cases and 12 form/backup/merge browser cases passed on the updated worktree.

**Goal:** replace React Router with file-based TanStack Router while preserving the client-only SPA, URLs, backend contracts, authentication, mutations, preferences, and test coverage. Adopt the concrete route-context/query-options pattern from [TkDodo's fourth post](https://tkdodo.eu/blog/reliable-query-prefetching-with-tanstack-router).

**Baseline history:** #1177 (`8bf0b94`) supplied Query/devtools 5.102.8, Form 1.33.5, `cn` 0.2.6, Radix 1.6.7 subpaths, date-fns 4.4, and MSW 2.15. Implementation began from its successor #1178 (`89ea859`), including MSW Storybook addon 3. The earlier whole-plan review and isolated proof used main `0af2a70` plus explicit proof dependency pins; those results remain historical.

**Companions:** [decision and four-post research](../research/2026-09-06-tanstack-router.md), [query integration example](../examples/tanstack-router-query.md), [native mutation assessment](../research/2026-09-06-tanstack-mutations.md), [typed mutation example](../examples/tanstack-query-mutations.md).

**Proof completed, 2026-09-06:** an isolated session-artifact fixture passed 13 unit/Chromium cases, raw TypeScript (including negative navigation assertions), split-route Vite and Storybook builds, and a built-SPA Chromium smoke. It uses the unchanged main Oxc compiler with Router 1.170.32 and Query 5.102.8. [Evidence, reproduction and limits](../research/2026-09-06-tanstack-router.md#isolated-proof-results).

That proof resolved the narrow feasibility gate without editing production. The authorized implementation subsequently changed the entry, routes and dependencies, retaining the backend and Firebase configuration. Live Firebase and Azure deployment behavior remain release checks, not claims made by local mocks.

## Implementation evidence

After native Storybook adoption, the workspace passes 254 client unit/browser cases and 14 built-app Playwright flows, run sequentially with one worker. The unchanged API's earlier 212 cases passed. TypeScript, type-aware lint, formatting, Knip, frozen installation, deterministic route generation, and application/Storybook builds pass. Production JavaScript measures **337.77 kB Brotli**, below the unchanged 360 kB budget, with execution timing disabled. No backend/shared-contract changes or E2E auth markers appear in production assets.

The independent review found three runtime defects that passing unit coverage had missed: malformed/repeated search surviving Router's merge, same-UID profile updates trapped below memoized route matches, and expired-session login redirecting back while Firebase still had a user. Each was reproduced as a failing built-app flow and corrected. AuthContext now receives the host snapshot above the route tree; invalid known search values are explicitly overwritten; reauthentication signs out before reopening login.

Preference coverage exposed stale snapshot rollback and retired-cache resurrection. The focused fix preserves concurrent writes and immediate feedback, retains later valid optimistic updates, reconciles after overlapping writes settle, and does not repopulate a replaced query cache. It does not introduce a server queue or change the preference API.

Storybook now uses official `@storybook/tanstack-react@10.6.0` to clone the generated tree and inject stories. Its MSW 3 loader composes overrides before defaults and supplies per-story Query/auth services before native router initialization. Loading stories override only the leaf prefetch, retaining real component/Query pending behavior; error/retry stories retain real loaders and app boundaries.

The user authorized the native framework proof and conditional migration at 22:20 CEST. The proof passed, so the full switch is complete: `RouterContext.story`, `RouteContent`, route wrappers, manual story-router/slot code, and the production shell's story branch were removed. The stock framework remains unmodified: Link attempts are mocked, `useNavigate` is real, and E2E covers actual Link navigation. Live args were verified in running Storybook; that channel is unavailable in the Vitest runner. [Configuration and observed results](../research/2026-09-06-storybook-tanstack-framework.md) are preserved.

## Module depth, interfaces, and seams

| Module                            | Owns                                                                                                                                                  | Must not own                                                                                    |
| --------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------- |
| Router                            | Matching, validated URL state, auth gate, when to start queries, navigation/pending/error boundaries                                                  | A second copy of activities/categories/preferences                                              |
| Query options + QueryClient       | Keys, fetch functions, server-data freshness, observers, invalidation                                                                                 | Navigation policy or URL parsing                                                                |
| Activity/category mutation module | Typed variables and native Query result/options as its interface; ordered HTTP steps, failure effects and reconciliation hidden in its implementation | Requiring forms to pass a QueryClient, interpret effect receipts, or assemble route submissions |
| Session runtime module            | One mounted host with injected auth/history adapters; initialization, identity retirement, token binding and cleanup hidden in its implementation     | Making every route/form repeat account-transition ordering                                      |
| URL-state module                  | Validated known search values and update/serialization rules shared by routes and controls                                                            | Re-parsing dates/periods independently in each caller                                           |
| Page/components                   | Rendering, local interaction state, choosing critical versus optional query consumption                                                               | Reconstructing prefetched options from a second params/search interpretation                    |

These are ownership clusters, not a requirement for new packages/classes. Keep cache-effect receipts and transport seams internal to the mutation module. Inject real variations only: Firebase versus deterministic auth adapter, browser versus memory history, and production HTTP versus stubbed fetch/MSW. Do not add an `ActivityOperations` mock at every form; tests must exercise the real write policy. Removing a useful module should make its complexity reappear across callers, not simply delete pass-through plumbing.

No TanStack Start, SSR, API redesign, server filtering/pagination, visual redesign, Query major upgrade, or new client-state library. Preserve merged #1177's library/API changes, including direct `queryClient.query` calls (no new helper), `cn` replacement and Radix subpaths; do not duplicate or undo its modernization. Keep TanStack Form and current trigger/focus conventions. Fix issues caused by, worsened by, or tightly coupled to the migration in this change; assess affected cases before editing. Unrelated pre-existing issues do not automatically become migration work.

## Target routes and data requirements

Use `client/src/app/routes` to avoid an unnecessary directory relocation. Generated output is `client/src/app/routeTree.gen.ts`.

| New file                           | Public URL       | Loading contract                                                                                                                   |
| ---------------------------------- | ---------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| `__root.tsx`                       | All              | Typed runtime context; global not-found/error handling. No private requests.                                                       |
| `login.tsx`                        | `/login`         | Public login, safe `returnTo`, redirect already-authenticated users.                                                               |
| `_authenticated.tsx`               | Pathless         | Wait for Firebase; gate children; define shared query options; prefetch optional preferences.                                      |
| `_authenticated.index.tsx`         | `/`              | Redirect to `/welcome`, preserving supported URL state.                                                                            |
| `_authenticated.welcome.tsx`       | `/welcome`       | Start recent activities, categories, and full history in parallel. Recent/categories critical; history optional for stats/heatmap. |
| `_authenticated.activity-list.tsx` | `/activity-list` | Activities + categories critical; preserve date filtering, text search, export/import/edit/delete.                                 |
| `_authenticated.charts.tsx`        | `/charts`        | History critical; prefetch categories for existing grouping/filter controls without newly blocking on them.                        |
| `_authenticated.compare.tsx`       | `/compare`       | History critical; compare periods remain client-side.                                                                              |
| `_authenticated.settings.tsx`      | `/settings`      | Activities + categories critical; preferences remain optional.                                                                     |

Route IDs contain `/_authenticated`; public URLs do not. Add an explicit not-found component, not a catch-all redirect that hides broken links.

## Delivery sequence

Prefer two deployable changes: behavior-covered preparation while React Router still works, followed by one atomic router cutover. First task 0, then task 1's proof, then task 2. Tasks 3-7 are coordinated workstreams, not a strict sequence: wire the minimum bootstrap, generation and Storybook adapter before porting consumers; task 7 is final cleanup, not the first build integration. Do not ship two browser routers or a dashboard-only migration.

### 0. Establish behavioral coverage on refreshed main

Before changing auth, options, mutations, or router adapters, reuse the current suites and add missing cases at their existing interfaces. Distinguish a behavior to preserve from a baseline defect; do not encode known incorrect behavior as the expected result. Record the refreshed commit and resolved versions. Repeat affected baseline cases if main changes during the work.

Confirm the seams in this table before writing new tests. This is baseline characterization, not a bulk suite against imagined modules: for each new/changed behavior use one failing scenario, one implementation change, then the next scenario. Follow merged `CONTEXT.md` terminology: an activity entry, an activity name, rename, merge, and restore are different operations.

| Surface                      | Existing coverage to preserve                                                                   | Add before the affected refactor                                                                                                                                                        |
| ---------------------------- | ----------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Ordered writes and effects   | `data/{actions,action-effects,action-policy}.test.ts`                                           | Active/inactive query refresh counts, unmount during save, acknowledged write/read failure, duplicate submission                                                                        |
| Backups/details/names        | `pages/DataIntegrity.stories.tsx`, `settings/{NameIntegrity,ActivityNameMerge}.stories.tsx`     | Retain restore/clear-details/merge consent/conflict/cancel/focus cases through new hooks; reuse `shared/` validators and identities                                                     |
| Auth/preferences             | `routes/_layout.test.ts` optional-preference failure                                            | Delayed initialization, deep-link return, sign-out/account switch, in-flight completion, overlapping toggles with failure                                                               |
| URLs/navigation              | Existing page stories and `e2e/navigation.test.ts`                                              | Date/period round trips, back/forward, malformed/unknown search, mobile close, deep-link refresh                                                                                        |
| Query coordination/toolchain | Query/API unit tests, `routes/client-loaders.test.ts`, `_layout.test.ts`, native compiler tests | Preserve merged stale/invalidated reuse, observer refetch/invalidation and nonblocking preference cases; add Router-specific context identity and preserve clean-checkout build/typegen |

Use Vitest node tests with real QueryClient/QueryObserver and stubbed fetch for data behavior; existing browser stories with real hooks and MSW for rendered mutation behavior; Playwright for full routing/auth/history. Do not stub the operation whose reconciliation is being tested. Add only routing harness differences when porting assertions to TanStack.

**Exit:** coverage exists before each affected implementation starts. Fix migration-related baseline defects with a focused regression first; classify truly unrelated defects separately. Do not delete old behavior coverage until its replacement passes; retain Request/intent tests while the legacy adapter exists, then remove adapter-only cases after its deletion.

### 1. Establish the post-upgrade baseline and prove tooling compatibility

**Files:** `client/package.json`, `client/vite.config.ts`, `client/vite/react-compiler.ts`, `client/tsconfig.json`, `.github/actions/setup/action.yml`, `client/.storybook/main.ts`, `knip.json`. Start from #1176's native Oxc React Compiler, native/type-aware Oxlint, Oxfmt, and raw TypeScript gates; do not restore the superseded Babel/checker integration.

Record build output, initial/lazy chunks, and cold/warm request counts against task 0 on merged #1177 or later main. Pin mutually compatible Router/plugin/CLI versions; Router 1.170.32 and plugin 1.168.35 are proof pins, not equal-version requirements. Query 5.102.8 is now merged, so the old 5.90.21 alternative is no longer the planned target. Re-run affected proof/harness cases against main's resolved dependencies, particularly its newer MSW pair; do not describe the earlier fixture as testing those versions.

Confirm synchronous route `context`, inferred `getRouteApi`, Zod 4 validation, and generated file routes against React 19/Vite 8/TypeScript 7. Use the existing Vite and TypeScript tools in an isolated spike; no standalone build framework.

Prove a small login/protected-read flow in an isolated spike using the session runtime module, real generated route context and memory history. Include initial unknown-to-authenticated resolution, UID changes, and disposal; do not defer this design until every mutation has been rewritten. Firebase auth initialization and login actions (`getAuth`, Google popup, email sign-in/sign-up) stay behind the same real/mock auth seam.

**Exit / proof result:** these fixture-level conditions passed with deterministic auth and HTTP adapters. The runtime gates unknown auth, survives StrictMode cleanup/restart, rejects retired tokens before/after awaits, preserves same-UID caches, and isolates late reads/writes on account switch. Reuse the findings, not an automatic copy of fixture code. The real Firebase adapter and complete app still require coverage before broad conversion.

### 2. Decouple mutations without changing routers

**Files:** `client/src/app/routes/{welcome,activity-list,settings}.tsx`, merged `data/{actions,action-plan}.ts` and their tests, focused mutation hooks, `.storybook/preview.ts` and `mocks/actionRouting.ts`. Reuse `shared/{types,command-validation,record-validation,backup,activity-names}.ts`; do not reimplement merged validation or identity rules.

**Native target:** Query `useMutation` with typed operation variables, optionally shared through `mutationOptions`, not a replacement Router action system. TanStack Router does not manage submission state. Keep required cache effects in mutation options and mounted-only dialog/reset/navigation behavior in the component.

Merged `runAction` accepts Request/FormData plus a route label; it is not the final typed interface. Reuse its steps and policy inside the mutation module; forms use focused hooks with typed variables and native Query state. Keep route allowlists/intent parsing in temporary React Router adapters only. Neither forms nor stories reconstruct Requests to exercise the new interface.

During transition, `runAction` may remain the sole invalidation owner. Finally, private operation receipts/failures pass effects to the module's native Query callbacks; public results contain useful domain data or void, not cache keys. Move ownership atomically, sharing reconciliation with remaining adapters. No parallel executor, command bus, or mandatory receipt layer for trivial fixed-effect mutations.

Convert `useFetcher` surfaces: add/detail forms, edit/delete table rows, delete-all, file upload, onboarding, category create/edit/delete, activity-name create/rename, and assignment. Preserve explicit-target and implicit-current-route submissions alike. Retain each form's TanStack Form validation, date serialization, toast behavior, and self-contained dialog triggers.

The operation must reject known failures; a fulfilled `{ error }` result must not set `isSuccess`. Return/await parallel invalidations of affected query families in `onSuccess` and, for partial/uncertain writes, `onError`. Only active queries normally refetch; do not add `refetchType: "all"`, universal MutationCache invalidation, or blanket Router invalidation.

Keep save pending through active refresh settlement, but distinguish "write acknowledged, refresh failed" from "write failed". Default invalidation does not throw on refetch failure; surface that read error without suggesting a duplicate POST. Do not casually make `onSuccess` throw because a subsequent read failed.

| Operation group                                   | Minimum cache effects to preserve                                                                                                                                     |
| ------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Add/edit/delete activity                          | Full history + every limited-history variant                                                                                                                          |
| Restore/import, onboarding import                 | Full/limited history, categories, preferences                                                                                                                         |
| Delete-all                                        | Full/limited history under inspected #1175; retain extra effects only if the merged operation actually changes them                                                   |
| Category/name mutations                           | Categories + full/limited history, including server-derived `active`/membership changes                                                                               |
| Category deletion after delete/reassign succeeded | Invalidate completed effects even if deleting the category subsequently fails                                                                                         |
| Preferences                                       | Preserve immediate optimistic UX, infinite stale time, rollback/reconciliation; exercise overlapping full-document edits before accepting the existing implementation |

Treat #1175's operation-specific rules as authoritative where more precise. Leave export as a download/read operation, not a route action.

Use `mutate` where mutation state is already the form's submission authority. Use `mutateAsync` only when Form or the caller needs the promise; let rejection reach Form and handle `handleSubmit()` rejection at the UI event seam. Do not derive server success from Form's dispatch-only success state or implement duplicate reset/toast mechanisms.

Keep ordinary activity/category writes pessimistic with targeted refresh. `mutationKey` neither deduplicates nor serializes writes. Preserve no automatic retries; prevent accidental repeated submissions without collapsing intentionally distinct entries on the same date. Use a scope only where write ordering is required, not an app-wide queue. Required lifecycle callbacks continue after unmount; per-call callbacks are UI-only.

Preferences stay on the existing module unless affected cases justify changes. Current main already returns the `onSettled` invalidation promise; do not plan that as a missing fix. Establish overlap/failure coverage first. Fix related or introduced races here; scope alone does not serialize optimistic `onMutate`. Prefer the smallest proven change; do not prescribe a queue/patch-overlay redesign before reproduction or silently drop/disable toggles.

**Tests/exit:** existing mutation stories still pass under React Router; cover typed operation success/failure, adapter unknown intents, partial/uncertain writes, affected-only request counts, inactive cache entries, unmount during save, acknowledged-write/read-refresh failure, repeated submits, reopen/reset/focus, account switch, and overlapping preference edits with one failure. Use the [example's regression contract](../examples/tanstack-query-mutations.md#5-regression-contract-before-cutover). This preparation can merge independently.

### 3. Replace framework bootstrap and establish safe auth lifetime

**Files:** new `client/index.html`, `client/src/main.tsx`, `client/src/app/{router.tsx,router-context.ts}`; replace `app/root.tsx` and `entry.client*.tsx`; extract current `_layout.tsx` shell/auth behavior.

Use Vite's HTML entry and `createRoot` on `#root`, not `hydrateRoot(document)`. Preserve document language, metadata, icons, manifest, font preconnects, root sizing, CSS, and initial loading UX from the old document layout.

The session runtime module creates one QueryClient shared by Router context/provider, covering pending/error rendering. It owns router creation, subscription cleanup, retirement and adapter lifetimes. Its low-level factory accepts memory history for tests; callers do not manage that sequence manually. Distinguish auth initialization from UID changes so initial resolution does not start and immediately retire duplicate private loads.

Move Firebase waiting/redirecting into protected `beforeLoad`; remove repeated child waits only once the guard-order regression test exists. Keep an AuthContext bridge for existing components. Keep private preferences queries disabled/unmounted on `/login`: moving QueryClientProvider above login must not accidentally start `useUserPreferences` via `StylesProvider`.

Preserve safe login return behavior and intentionally improve it to retain query/hash. Normalize same-origin internal destinations; reject external/protocol-relative/backslash paths and `/login` loops. Signed-in visits to login and successful sign-in should use history replacement.

On UID change, gate protected UI before exposing the next account; retire its QueryClient and router, cancel/clear old queries, and create a fresh runtime at the current browser location. Clean up listeners. Bind token suppliers to the initiating runtime/UID and check identity before and after token retrieval; retired work must not obtain the next account's token. Old mutation completions must remain attached to the retired runtime, never update a new account's cache or trigger new-account navigation/toasts. Cancellation does not undo a write already received by the server. Do not rebuild merely on token refresh with the same UID.

This internal lifetime policy preserves query keys without a simultaneous key redesign. `router.invalidate()` alone is insufficient because synchronous context may be reused; `clearCache()` does not remove committed matches. Dispose only history/listeners owned by the retiring runtime, not an injected shared browser history. Keep the external auth subscription above the retiring view so it cannot miss the next sign-in.

**Tests/exit:** delayed Firebase initialization, signed-out direct deep links with zero private requests, sign-in return, signed-in login, sign-out, account switch at the same URL, token refresh, and in-flight query/mutation completion after sign-out. API authorization remains unchanged.

### 4. Port the full route tree and apply the fourth-post contract

**Files:** target route table above, `data/queryOptions.ts`, existing activity/category/preferences hooks, page hooks, `WeeklyHeatmap`, and extracted page shell.

Define inherited activity/category/preference query options in synchronous protected route context. Define recent-history options in the welcome route. Context construction must be pure and must not fetch or capture a mutable user identity before auth resolves.

Page loaders initiate the concrete context queries; page/shared hooks observe them via typed `getRouteApi`. On Query 5.102.8, reuse the modernization PR's `queryClient.query` equivalents for prefetch/ensure behavior, including error handling and freshness-only overrides. Keep query factories in the data layer, not route modules, and keep route option objects out of structural-sharing selectors that require JSON-compatible values.

Start every required query before rendering. Retain the existing blocking policy on history/settings/charts/compare initially; make the dashboard's existing progressive rendering explicit using Suspense for recent/categories and non-blocking history. Do not make a slow heatmap delay logging an activity. Preferences stay optional as in #1176.

Do not return activity data from loaders for `useLoaderData` consumption. Keep Query's ten-minute freshness/GC and preference override. Set Router intent preloading and preload stale time zero; do not set a second ten-minute Router freshness policy.

**Tests/exit:** loader and hook derive their query key/function/inputs from the same context options; imperative freshness-only overrides do not drift or leak into observers. Cold dashboard requests start without a waterfall; one request per required key under controlled no-retry conditions; warm hover/click does not refetch fresh data; stale/invalidated data follows the chosen policy; optional failure does not blank the page.

### 5. Preserve URL state and navigation behavior

**Files:** `components/forms/DateFilterForm/shared.ts`, `pages/{Compare,compare-utils}.ts*`, navigation components, all `Link`/`useNavigate` consumers, protected search schema module.

Centralize the existing cross-page search contract on the protected parent: optional `startDate`, `endDate`, and comma-separated `periods`. Retain local date-only parsing/serialization and period IDs/colors; do not silently replace the wire format with JSON arrays or UTC timestamps. Existing malformed-date/period tolerance should remain explicit and tested, not become a route crash by accident.

Preserve unrelated search values when links/controls currently preserve them. Characterize repeated keys and JSON-looking unknown values before choosing a custom parser; use Router's default parser only if those compatibility tests pass. Known search fields need typed validation even if unknown fields are preserved.

Use typed `Link`/navigation destinations and search updaters. Preserve date changes as push entries, comparison changes as replace entries, clear-filter behavior, sidebar search carry-over, active styling, mobile-menu close, view transitions/reduced-motion behavior, browser back/forward, and scroll restoration.

Dates and comparison periods are presentation filters, not HTTP inputs: do not add them to `loaderDeps` or Query keys. If a later feature changes server fetching, derive only those inputs in `loaderDeps`, then construct options in context as shown in the example.

**Tests/exit:** old bookmarked URLs, copied deep links, new-tab links, back/forward, cross-section filter retention, malformed/repeated params, timezone-west-of-UTC dates, query-only updates without unnecessary requests, and typed rejection of invalid route/search usage.

### 6. Replace router-specific errors and test scaffolding

**Files:** `components/states/{RouteErrorBoundary,ErrorView,HydrateFallback}.tsx`, their stories, `mocks/{decorators,testContext,mockAuth}.ts*`, `.storybook/{main,preview}.ts`, stories using `reactRouterParameters`, `e2e/navigation.test.ts`, `playwright.config.ts`.

Use Router error props and a separate not-found component instead of React Router's `useRouteError`/`isRouteErrorResponse`. Pair Router recovery with `useQueryErrorResetBoundary`; exercise both retry and navigating away/back. Preserve intentional session-expired versus generic-error UI using a status-bearing API error where required; the current generic `Error("HTTP...")` is not a reliable status discriminator.

Show optional/background query errors without discarding usable cached data. Do not add catch-and-return-empty fallbacks. Keep query-derived errors separate from auth redirects and search validation errors.

Replace the Remix Storybook addon with a small memory-router adapter. Query-aware stories using `getRouteApi("/_authenticated")` must have that real matching ancestor and its context, not an arbitrary wrapper route. Pure rendering stories can stay lightweight. Keep router/client stable for a story, isolate both between stories, and initialize MSW before loaders. Mock auth includes login actions; mocking `useAuth` alone does not cover `Login.tsx` calling Firebase directly.

Delete duplicated mock actions/invalidation bridges only when real mutations are exercised through existing MSW handlers. Adapt #1175's shared story action seam rather than resurrecting the old mock switch. Preserve per-story initial URLs/search/auth and route error fixtures.

Replace the old E2E entry swap with an equivalent Vite entry/mock-auth mechanism that initializes before router creation and is excluded from production output. Keep service workers disabled for E2E. Use the existing Playwright setup and extend its auth mock to allow signed-out/account-transition cases.

**Tests/exit:** existing Storybook/browser stories and navigation E2E work on the new router; failed query retry recovers, invalid URLs have a not-found UI, story state does not leak, and production contains no mock-auth activation.

### 7. Finish build/deployment integration and remove React Router

**Files:** `client/{package.json,vite.config.ts,tsconfig.json,react-router.config.ts}`, generated route tree/config, root `package.json`, `bun.lock`, `.gitignore`, Oxc ignores after #1176, `knip.json`, CI/README/AGENTS routing references.

Use the Router plugin before the React plugin with automatic splitting. Reuse a single generation configuration (`client/tsr.config.json`) across plugin and one-shot CLI typegen; no competing watcher. Include explicit `routeFileIgnorePattern` for `\\.(test|spec|stories)\\.[tj]sx?$` and `routeFileIgnorePrefix: "-"`: merged `routes/_layout.test.ts` must not become a route. Put new harness tests outside the route directory.

Commit `routeTree.gen.ts`, exclude generated code from formatting/linting, and check regeneration drift. Configure the plugin's Storybook/Vitest behavior explicitly in the early spike: route-aware browser tests need the same context/splitting conventions; plain node tests must not unexpectedly load browser/bootstrap modules. Preserve `vite/react-compiler.test.ts` and prove plugin order rather than only checking a successful transpilation.

**Proven harness correction:** add explicit `optimizeDeps.include` for `@tanstack/react-query`, `@tanstack/react-router`, and `zod`. Without it, the fixture reoptimized after loading a split route and broke Storybook's dynamic import mid-test. A full cold-cache run passed with this setting; do not replace it with sleeps or retries.

Replace `react-router build` with `vite build` and framework typegen with `tsr generate`; preserve externally used script names (`build`, `build:e2e`, `serve`, `serve:e2e`, `test`, `test:e2e`, and `typecheck`). Keep `typecheck` as generation followed by raw `tsc --noEmit`, and retain the merged `bun run typecheck && ...` gates in application, E2E, and Storybook builds plus CI. Remove `.react-router/types`, `@react-router/node` types, framework config, and obsolete route types/imports.

Explicitly keep **Vite output at `client/build/client`** by setting client-relative `build.outDir: "build/client"`. Preserve PWA output there. This avoids unnecessary Azure deploy/preview/size-limit path churn; still inspect `.github/workflows/{azure-static-web-apps,size-limit,test,chromatic,knip,lint}.yml`, `.size-limit.json` (merged #1177 named `Client JavaScript` budget: **360 kB**), and shared setup. Do not raise the bundle budget merely to make the migration pass.

Retain `public/staticwebapp.config.json` fallback to `/index.html` and exclusions for `/api/*`/assets. Check deep-link refresh on the Azure preview, not just Vite dev. Preserve PWA update/install behavior and old-service-worker upgrade behavior.

Remove direct React Router framework/runtime dependencies and `storybook-addon-remix-react-router` after every consumer is migrated. Audit `isbot`/old compiler helpers for direct usage before removing anything; do not blindly remove #1176's retained compiler integration. Update Knip entry discovery, setup typegen commands, and repository documentation.

**Exit:** no old-router imports/config/types remain outside historical docs; no unused production mock auth; clean-checkout generation, build, preview, story build, and deployment fallback work.

## Acceptance commands and release gates

During implementation, run the smallest existing selector for each task. Use the merged #1176 scripts and native Oxc toolchain rather than reinstalling/reintroducing old lint tools.

```bash
cd client
bun run test --project unit src/data/queryOptions.test.ts
bun run test --project unit src/data/actions.test.ts src/data/action-effects.test.ts src/data/action-policy.test.ts
bun run test --project storybook src/pages/Welcome.stories.tsx
bun run typecheck
bun run build
bun run build-storybook
bun run test:e2e
```

Add targeted route/auth/search tests under the existing unit project for pure logic and existing browser/story runner for rendering. At cutover, use the existing client tests, repository lint, Knip, and applicable builds because bootstrap/toolchain/shared-operation changes cross those boundaries. Size-limit may measure bundle size with the configured `running: false`; preserve that setting to avoid resource-intensive browser execution timing. API tests are needed only if a shared contract or API surface is actually changed; this migration should not require that.

Release must demonstrate all seven URLs, unknown routes, auth transitions, all mutation groups, error recovery, filter/history compatibility, theme/onboarding/heatmap behavior, and Azure deep-link/PWA behavior. Report observed deltas rather than assuming a speedup; retain size-limit's disabled execution timing. The size numbers above are historical results, not a reason to re-enable timing.

## Rollout, rollback, and effort

Deploy the complete cutover to the existing Azure PR preview first. Keep production on the working React Router build until acceptance passes. The preparation step remains compatible with either router.

Rollback is redeploying the previous frontend artifact/reverting the cutover; there is no database migration. Include service-worker cache/update behavior in that rollback rehearsal so clients are not stranded on missing old chunks.

Planning estimate: **5-8 focused engineering days** on the merged toolchain, with uncertainty concentrated in auth/runtime transitions, mutation parity, Storybook, and compiler/plugin compatibility. Task 1 should revise that estimate before implementation. Stop the cutover if those risks remain unresolved rather than shipping a partial migration.

## Whole-plan review disposition

| Finding                                                  | Resolution                                                                                                                                       |
| -------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| Important coverage was scheduled after refactoring       | Task 0 now precedes affected changes and preserves merged regression contracts.                                                                  |
| Auth ordering was an undocumented caller burden          | One session runtime module; prove initialization/retirement with real/mock adapters first.                                                       |
| Mutation interface exposed transport/effect plumbing     | Keep it internal; forms use typed variables and native Query state.                                                                              |
| File generation/test harness assumptions were incomplete | Explicit test-file exclusion, matching ancestor context, early plugin/MSW/auth setup.                                                            |
| Baseline and adjacent work had drifted                   | Review/proof recorded against `0af2a70`; #1177 now merged at `8bf0b94` and becomes the implementation baseline, with its API/coverage preserved. |
| Preference repair could grow beyond the migration        | Cover affected behavior first; fix related regressions, avoid speculative redesign.                                                              |

**Verdict:** the approved migration is implemented and locally validated. Keep the Azure preview/live Firebase/PWA upgrade acceptance steps before production rollout; local mocks and builds do not establish those external outcomes. Pull-request publication does not imply production deployment.
