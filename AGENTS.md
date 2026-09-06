# Activity Tracker

Sports activity tracking web app (React 19 + Azure Functions + Firebase).

## Commands

```bash
bun install                       # Install dependencies
bun run dev                       # Start frontend (:3000) and API (:7071)
bun run --filter '*' build        # Build both workspaces
bun run lint                      # Oxlint (zero warnings)
bun run lint:fix                  # Apply safe lint fixes
bun run format                    # Format with Oxfmt
bun run format:check              # Check formatting without writing
cd client && bun run test         # Run Storybook vitest tests
cd client && bun run storybook    # Start Storybook (:6006)
cd api && bun run test            # Run API unit tests
```

Use a supported Node 22 (>=22.22) or 24+ runtime on PATH. Bun lifecycle scripts can invoke Node, so installing Bun alone does not satisfy the build tools' runtime requirements.

## Structure

- `/client` — React frontend (Vite 8, React Router v8 SPA mode, shadcn/ui + Tailwind CSS v4, TanStack React Query)
- `/api` — Azure Functions backend (TypeScript, Firebase Admin SDK)

### Client layout (`client/src/`)

- `app/routes/` — Route modules with loaders/actions. `_layout.tsx` is the auth guard wrapper.
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
- **Route actions**: Handle mutations via `intent` field (edit, delete, delete-all).
- **State**: Server state via React Query. Client preferences (theme, chart grouping) stored in Firebase and accessed via React Query hooks — no separate client state library.
- **Tooling**: TypeScript 7, Oxfmt, and Oxlint's recommended type-aware checks for both workspaces. Prefer native lint rules; use Oxlint's JS plugin API for remaining rule coverage.

## Testing

**Client**: Two vitest projects run via `bun run test` (`vite.config.ts` → `test.projects`):

- `storybook` (browser, Chromium): Storybook play functions as tests via `@storybook/addon-vitest`. MSW mocks API. Use `storybook/test` for assertions. Use deterministic data (seeded PRNG) for stable screenshot tests. Stories live in `*.stories.tsx`.
- `unit` (node): plain `*.test.ts(x)` files for pure logic that needs no DOM/browser (e.g. query options, `apiClient`). Stub `global.fetch` instead of MSW.

**API**: Vitest unit tests for validation, rate limiting, database CRUD. Handler tests must mock `firebase/firebase` (and modules importing it) since it calls `initializeApp()` at load.

All new code should include tests.

## Notes

- When making a mistake, document the lesson in the relevant MD file.
- Plans should be concise. In case of lack of enough information, ask for more details.
