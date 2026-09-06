# Activity Tracker

Sports activity tracking web app (React 19 + Azure Functions + Firebase).

## Commands

```bash
bun install                       # Install dependencies
bun run dev                       # Start frontend (:3000) and API (:7071)
bun run --filter '*' build        # Build both workspaces
bun run --cwd client typecheck    # Route typegen + native tsc --noEmit
bun run --cwd api typecheck       # Native tsc --noEmit (needs Firebase config)
bun run lint                      # Oxlint (zero warnings)
bun run lint:fix                  # Apply safe lint fixes
bun run format                    # Format with Oxfmt
bun run format:check              # Check formatting without writing
cd client && bun run test         # Run Storybook vitest tests
cd client && bun run storybook    # Start Storybook (:6006)
cd api && bun run test            # Run API unit tests
```

Use a supported Node 22 (>=22.22.1) or 24+ runtime on PATH, plus Git >=2.32 for lint-staged. Bun lifecycle scripts can invoke Node, so installing Bun alone does not satisfy the build tools' runtime requirements.

## Structure

- `/client` — React frontend (Vite 8, file-based TanStack Router SPA, shadcn/ui + Tailwind CSS v4, TanStack React Query)
- `/api` — Azure Functions backend (TypeScript, Firebase Admin SDK)

### Client layout (`client/src/`)

- `app/routes/` — File routes; `_authenticated.tsx` guards private routes. `routeTree.gen.ts` is generated, excluded from formatting, and checked for drift in CI.
- `components/ui/` — shadcn/ui primitives (no stories or tests needed for these)
- `components/` — Domain components: `forms/`, `table/EditableTableRow/`, `visualization/` (incl. `WeeklyHeatmap/` — 52-week activity heatmap on the dashboard), `navigation/`, `states/`, `styles/`
- `data/` — React Query hooks, API functions, types (`types.ts`), Zod validation
- `pages/` — Page components + split utility modules (e.g., `compare-utils.ts`, `PeriodSelector.tsx`, settings tabs)
- `mocks/` — MSW handlers and mock data for Storybook
- `utils/` — Shared utilities (`cn`, colors, icons, chart hooks)

## Key Conventions

- **Import alias**: `@/*` → `./src/*`. shadcn `cn()` lives at `@/utils/cn`.
- **Dialog a11y**: Always use self-contained `DialogTrigger` inside `Dialog` for Radix focus restoration. Never use separate `onClick` + controlled open.
- **React 19**: ref-as-prop (no forwardRef). JSX transform (no React import).
- **File size**: Keep under ~250 lines. Split into focused modules.
- **Route data**: Construct concrete query options in route context and reuse them in loaders and Query observers. Keep imperative `"static"` freshness overrides out of shared observer options.
- **Mutations**: Typed Query mutations own write/reconciliation behavior; UI callers own feedback and dialog dismissal.
- **State**: Server state via React Query. Client preferences (theme, chart grouping) stored in Firebase and accessed via React Query hooks — no separate client state library.
- **Tooling**: TypeScript 7, Oxfmt, and Oxlint's recommended type-aware checks for both workspaces. Prefer native lint rules; use Oxlint's JS plugin API for remaining rule coverage.
- **Type checks**: Keep `tsc --noEmit` separate from type-aware linting. Client builds and CI enforce it after route type generation; API deployment CI enforces it after providing Firebase config.

## Testing

**Client**: Two vitest projects run via `bun run test` (`vite.config.ts` → `test.projects`):

- `storybook` (browser, Chromium): Native `@storybook/tanstack-react` framework with play functions via `@storybook/addon-vitest`. Configure routes with `parameters.tanstack.router`; put router-dependent layouts inside `render`, not outer decorators. MSW mocks API. Use `storybook/test` for assertions and deterministic data (seeded PRNG). Stories live in `*.stories.tsx`.
- `unit` (node): plain `*.test.ts(x)` files for pure logic that needs no DOM/browser (e.g. query options, `apiClient`). Stub `global.fetch` instead of MSW.

**API**: Vitest unit tests for validation, rate limiting, database CRUD. Handler tests must mock `firebase/firebase` (and modules importing it) since it calls `initializeApp()` at load.

All new code should include tests.

## Notes

- When making a mistake, document the lesson in the relevant MD file.
- Plans should be concise. In case of lack of enough information, ask for more details.
- Vite browser tests need explicit Query/Router/Zod prebundling; late discovery through split routes otherwise reloads the runner mid-test.
- Keep size-limit's `running: false`: browser execution timing repeatedly exhausted the user's machine. Size measurement remains enabled.
