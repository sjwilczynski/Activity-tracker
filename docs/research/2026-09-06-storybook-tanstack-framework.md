# Storybook's TanStack framework

**Final conclusion: migration succeeded.** Official **`@storybook/tanstack-react@10.6.0`** now replaces our direct React-Vite framework and manual router harness. It supports our Router-only SPA without Start/SSR or private plugin overrides. The initial recommendation to defer treated configurable defaults as blockers and undervalued removing Storybook-specific production code.

The user authorized a focused proof and migration if successful at 22:20 CEST. The sections below retain the source investigation and distinguish alternatives from the configuration actually adopted.

## Observed implementation results

- Normal Activity List rendering, a real edit mutation, date search, leaf-prefetch loading override, and genuine loader error/retry all pass on the stock framework.
- Programmatic navigation through real `useNavigate` renders the destination page. Actual Link navigation still passes the 14 application E2E flows; the framework's import mocks were not bypassed.
- The complete client run passes 254 cases across 41 files with one worker and no file parallelism. Raw TypeScript also includes `.storybook` configuration now. Production and native Storybook builds, lint, and Knip pass.
- `LiveStoryArgs` updates in the real Storybook preview. Its Vitest-runner attempt did not have a live args channel; the interactive story is tagged `!test`, with that distinction documented rather than hidden.
- The manual story router, `StoryContent`/`StorySlot`, production `story` fields, `RouteContent` and wrapper components were removed. `.storybook/tanstack.tsx` supplies only defaults, services and compact layout/provider setup.

The trial snapshot and logs are retained in session artifacts under `files/storybook-native-proof/`. No second production router or Start package was introduced.

### Practical corrections established by the proof

Use the framework package name `@storybook/tanstack-react` in `main.ts`, not an absolute directory computed from `package.json`: this package resolves its preset through exports, and the directory-based form failed to load.

Router-dependent layouts in ordinary story decorators render outside the native router. Moving the sidebar's layout into its story `render` fixed its three failing cases without changing application components.

Wait for a ready control when an interaction requires it. A dashboard story's assertion that no progressbar existed could pass before Suspense had mounted and then race its combobox; awaiting that combobox removes the false-ready signal.

None of these corrections required removing the framework's interception plugin. Validation/builds were run sequentially; the final size-only measurement retained `running: false`.

## Supported configuration addresses the main concerns

| Concern                                              | Feasible approach                                                                                                                   | Support level                                                                          |
| ---------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------- |
| Initial loader is awaited                            | Override the leaf loader only in the component-loading story; retain the infinite HTTP response and real Query hook.                | Documented `routeOverrides.loader`.                                                    |
| App error/loading defaults differ from the framework | Prepare the supplied tree with public `route.update()` defaults in Storybook-only setup; framework cloning preserves those options. | Public TanStack API; not a dedicated framework defaults option.                        |
| Production sidebar duplicates isolated story layout  | Override `/_authenticated` with a compact Storybook layout.                                                                         | Documented `routeOverrides.component`.                                                 |
| Query/auth/MSW must exist before loaders             | Initialize services and MSW in a loader; the framework context factory reads `storyContext.loaded` before it loads routes.          | Documented context factory and Storybook lifecycle.                                    |
| Link clicks are recorded rather than navigated       | Keep stock behavior for component stories; use real `useNavigate`/`router.navigate` where necessary and full Link coverage in E2E.  | Stock framework behavior.                                                              |
| Real Link/Navigate required in every story           | Remove its module-interception plugin through `viteFinal`, retaining routing decorators and tree cloning.                           | Plausible version-coupled workaround, not a documented framework flag; must be proven. |

Sources: [framework docs][docs], [route parameter types][parameters], [tree cloning][cloning], [initialization][before-each], [Router mocks][mocks], [Storybook lifecycle][lifecycle].

## 1. Our existing component-loading case has a supported solution

`ActivityList` already renders its own progressbar while `useActivities()` loads. This story can disable only the leaf's awaited prefetch, keeping its real query, route context, auth guard and HTTP mock:

```tsx
parameters: {
  tanstack: {
    router: {
      routeOverrides: {
        "/_authenticated/activity-list": {
          loader: () => undefined,
        },
      },
    },
  },
  msw: {
    handlers: [
      http.get("*/api/activities", async () => {
        await delay("infinite");
      }),
    ],
  },
},
```

This tests **component loading**, not the initial route-pending boundary. That is a normal, explicit story distinction, not an architectural blocker. [Override documentation][overrides] [Our component](../../client/src/pages/ActivityList.tsx)

For actual route-pending coverage, mount a route successfully, then gate the next request, remove the relevant cached query, and invoke public `router.invalidate({ forcePending: true, sync: true })`. Observe the application's pending component while the next real loader is unresolved. Obtain the router through `useRouter()` in the rendered test harness. This is a candidate proof scenario, not a result already established.

The narrow limitation remains: 10.6.0 has no typed option to render before **initial** `router.load()` completes. A later `beforeEach` cannot interrupt that await. Initial route loading can remain covered by application E2E while stories cover the scenarios above. [Framework initialization][before-each] [Parameters][parameters]

## 2. Preserve application defaults without private-field patches

The framework clones the supplied tree's route options. In a Storybook-only setup module, use `route.update()` once to apply application `errorComponent`, `pendingComponent`, and `notFoundComponent` to routes lacking explicit values. Apply these before framework initialization, not by mutating a global tree differently for every story.

```tsx
function applyStoryDefaults(route: AnyRoute): void {
  route.update({
    errorComponent: route.options.errorComponent ?? RouteErrorBoundary,
    pendingComponent: route.options.pendingComponent ?? Loading,
    notFoundComponent: route.options.notFoundComponent ?? NotFound,
    pendingMs: 0,
    pendingMinMs: 0,
  });
  for (const child of route.children ?? []) applyStoryDefaults(child);
}
```

Giving each applicable route defaults avoids a framework fallback handling the error before an ancestor does. The existing 500-response story can retain its real failed loader and app error UI.

Although the override implementation spreads arbitrary options, its public `RouteOverrideOptions` does not declare error/pending fields. Prefer typed public `route.update()` to casts that rely on excess properties. [Public Route API][route-api] [Clone implementation][cloning] [Override types][parameters]

## 3. Navigation is a choice, not proof that migration is impossible

`useNavigate`, `useRouter` and most framework hooks wrap real implementations with spies. `Link` and `Navigate` are replacement functions that record attempts rather than navigating. They are not `fn()` mocks, so calling `mocked(Link).mockImplementation(...)` is not the advertised fix. Import replacement is performed by a Vite resolver, not just Storybook's ordinary automocking. [Router mocks][mocks] [Interception plugin][interception]

**Recommended initial proof:** use stock Link behavior for isolated component stories and retain actual Link navigation in the existing application E2E suite. Stories requiring a real transition can call the supported `useNavigate()` or `router.navigate()` APIs.

If preserving real Link behavior throughout Storybook is a requirement, public `viteFinal` can remove the plugin named `storybook:tanstack-react:module-interception`. This would retain framework routing/tree-cloning/story-injection while resolving Router imports normally. It also removes automatic Start/import mocks, which this Router-only app does not need.

That particular plugin name is **version-coupled implementation knowledge**, not a documented opt-out flag. Pin the framework version, assert that the expected plugin was found, and prove navigation in browser/build modes before adopting this workaround. Do not assume a Vite alias or `sb.unmock` overrides the resolver without evidence. [viteFinal][vite-final] [Preset][preset] [Interception source][interception]

## 4. Per-story services can be supplied before routes load

The framework supports a context factory receiving `storyContext`. Services can be created by a loader and then used both in Router context and React providers:

```tsx
parameters: {
  tanstack: {
    router: {
      route: routeTree,
      path: "/welcome",
      context: ({ storyContext }) =>
        storyContext.loaded.services.routerContext,
      routeOverrides: {
        "/_authenticated": { component: StoryLayout },
      },
    },
  },
},
```

This is a configuration shape, not a complete patch. The setup loader must initialize MSW with per-story overrides, create one QueryClient/auth adapter, and return those services. An outer decorator provides the same QueryClient and AuthContext to React, with appropriate cleanup.

Storybook loaders complete before framework `beforeEach`, so MSW can be ready before initial route fetching. Hook-derived values available only during render would be too late; use the documented context factory. [Context injection example][context-example] [Initialization][before-each] [Lifecycle][lifecycle]

## Meaningful simplification

Framework leaf injection and ancestor overrides now replace `RouterContext.story`, `RouteContent.tsx`, the route-level story wrappers, `StoryContent`/`StorySlot`, manual router construction/loading, and the story branch in `AuthenticatedShell`.

Query/auth/MSW setup remaining is ordinary integration work, not a reason to reject the framework. Eliminating those production testing hooks is a stronger benefit than the original assessment acknowledged. [Decorator][decorator] [Component overrides][parameters]

## Proof sequence used

The official framework, generated route tree, per-story services and compact layout override were tried reversibly before removing the old wiring. One browser worker ran sequentially:

1. A normal Activity List story and its mutation flow.
2. Its component-loading story with the supported loader override.
3. A real failed route loader with app error UI and retry.
4. One query/search interaction and one real navigation interaction.
5. Leaf injection with automatic splitting, including story controls.

Stock framework behavior was sufficient; the plugin-removal alternative was not needed. Following the successful proof, all remaining story parameters/type imports were migrated and the old story hooks removed.

The initial source investigation performed no installs or execution; the later user-authorized trial did. `running: false` remains the repository's size-limit setting; timing stays disabled.

## Sources

Source links are pinned to npm 10.6.0's git head `a77777356be2aeaff89d7a2b25254db7b2318392`. Its [manifest][manifest] is compatible with our React 19/Vite 8/Router versions; Start peers are optional.

[docs]: https://github.com/storybookjs/storybook/blob/a77777356be2aeaff89d7a2b25254db7b2318392/docs/get-started/frameworks/tanstack-react.mdx
[manifest]: https://registry.npmjs.org/@storybook/tanstack-react/10.6.0
[overrides]: https://github.com/storybookjs/storybook/blob/a77777356be2aeaff89d7a2b25254db7b2318392/docs/get-started/frameworks/tanstack-react.mdx#L102-L108
[parameters]: https://github.com/storybookjs/storybook/blob/a77777356be2aeaff89d7a2b25254db7b2318392/code/frameworks/tanstack-react/src/routing/types.ts
[cloning]: https://github.com/storybookjs/storybook/blob/a77777356be2aeaff89d7a2b25254db7b2318392/code/frameworks/tanstack-react/src/routing/duplicate-tree.ts
[decorator]: https://github.com/storybookjs/storybook/blob/a77777356be2aeaff89d7a2b25254db7b2318392/code/frameworks/tanstack-react/src/routing/decorator.tsx
[before-each]: https://github.com/storybookjs/storybook/blob/a77777356be2aeaff89d7a2b25254db7b2318392/code/frameworks/tanstack-react/src/routing/before-each.ts
[mocks]: https://github.com/storybookjs/storybook/blob/a77777356be2aeaff89d7a2b25254db7b2318392/code/frameworks/tanstack-react/src/export-mocks/react-router.ts
[interception]: https://github.com/storybookjs/storybook/blob/a77777356be2aeaff89d7a2b25254db7b2318392/code/frameworks/tanstack-react/src/plugins/module-interception.ts
[preset]: https://github.com/storybookjs/storybook/blob/a77777356be2aeaff89d7a2b25254db7b2318392/code/frameworks/tanstack-react/src/preset.ts
[route-api]: https://tanstack.com/router/latest/docs/framework/react/api/router/RouteType
[vite-final]: https://storybook.js.org/docs/api/main-config/main-config-vite-final
[context-example]: https://github.com/storybookjs/storybook/blob/a77777356be2aeaff89d7a2b25254db7b2318392/code/frameworks/tanstack-react/template/stories/LoaderContextInjection.stories.tsx
[lifecycle]: https://github.com/storybookjs/storybook/blob/a77777356be2aeaff89d7a2b25254db7b2318392/code/core/src/preview-api/modules/preview-web/render/StoryRender.ts
