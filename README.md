# Activity Tracker

A sports activity tracking web app for logging workouts, comparing performance across time periods, and visualizing trends with interactive charts. Built with a modern React stack, Azure Static Web Apps, and Firebase for authentication and data storage.

## Features

- **Dashboard** — Quick activity logging with autocomplete, stat cards (total, last 7/30 days, last activity), recent activity feed with clickable navigation, and first-time onboarding with category picker
- **Activity List** — Full activity history with search, date range filtering, pagination, month grouping, inline editing via dialogs, and bulk operations (rename, reassign category, delete by category)
- **Charts** — Stacked bar charts and multi-ring pie charts for activity distribution, with group-by-category toggle and date range filtering
- **Compare** — Side-by-side comparison of activity periods (month vs month, year vs year) with trend line charts and metric cards (total, most popular, most active day/month)
- **Settings** — Category management (add/edit/delete with activity reassignment), activity name management (rename, assign to category), and chart display preferences
- **Export / Import** — Full data export to JSON and import from JSON for backup and migration
- **PWA** — Installable as a Progressive Web App with offline support via service worker
- **Dark mode** — Dark/light theme toggle, persisted in user preferences

## Demo

![Activity Tracker demo](ActivityTracker.gif)

## Tech Stack

### Frontend

- **React 19**
- **TypeScript 7**
- **React Router v8** with SPA in framework mode
- **TanStack React Query** for server state management, caching, and optimistic updates
- **TanStack Form** for form state and validation
- **Tailwind CSS v4** with `@tailwindcss/vite` plugin and CSS-first configuration
- **shadcn/ui** components built on Radix UI primitives
- **Chart.js** with `react-chartjs-2` for data visualization
- **Vite 8** as build tool with HMR and PWA plugin; native **TypeScript 7** checks run separately
- **Storybook 10** with play functions for component and interaction testing
- **Lucide React** for icons, **Sonner** for toast notifications, **cmdk** for command palette, **date-fns** for date utilities

### Backend

- **Azure Functions** (Node.js 22) — serverless API with 19 functions covering CRUD for activities, categories, preferences, bulk operations (rename, reassign, delete by category), and data export/import
- **Firebase Admin SDK** for ID token verification and Realtime Database access
- **Rate limiting** middleware (per-user, per-function)

### Infrastructure

- **Firebase Auth** for client-side authentication (Google sign-in provider)
- **Firebase Realtime Database** as the primary data store
- **Azure Static Web Apps** for hosting with integrated serverless API routing

## Quick Start

Install Bun and a supported Node 22 (>=22.22) or Node 24+ runtime. Keep Node on
PATH: some dependency lifecycle and build scripts invoke it even when run through Bun.

```bash
bun install    # Install dependencies
bun run dev    # Start frontend (:3000) and API (:7071)
```

## Architecture

The app is split into two workspaces (`/client` and `/api`) managed as a bun monorepo.

Domain terminology is defined in [CONTEXT.md](CONTEXT.md). Three modules own the
cross-cutting data behavior:

- `shared/` defines stored records, backup validation, and activity-name ownership
  rules. Stored records and enriched display records are separate contracts.
- `api/database/activityNames.ts` applies name changes in Firebase transactions,
  including conflict handling when transactions retry against newer data.
- `client/src/data/actions.ts` implements mutations and cache invalidation for
  both production routes and Storybook; only the HTTP adapter changes.

### Client → API Communication

- In **local development**, Vite proxies `/api/*` requests from the frontend (port 3000) to the Azure Functions backend (port 7071)
- In **production**, Azure Static Web Apps handles the routing natively — the client and API are deployed together, and `/api/*` requests are routed to the Functions backend automatically without any proxy

### Authentication Flow

- **Client**: Firebase Auth handles sign-in (Google provider). The auth state is managed via `AuthContext` and a route loader redirects unauthenticated users to `/login`
- **API**: Each function extracts the Firebase ID token from the `x-auth-token` header, verifies it via the Admin SDK, and uses the resulting `userId` to scope all database operations

### Data Model

The data model keeps the **client simple** by pushing business logic to the API:

- **Activities** are stored as flat records keyed by Firebase push IDs, each containing `name`, `date`, and optional fields (`description`, `intensity`, `timeSpent`)
- **Categories** each contain an `activityNames` array — the **single source of truth** for which activities belong to which category, plus metadata (`name`, `active`, `description`)
- **Enrichment on read**: The API enriches activities with computed `categoryId` and `active` fields based on the category lookup before returning them to the client. This means the client never needs to perform the category ↔ activity join — it receives ready-to-render data
- **User preferences** (e.g., theme, chart grouping) are stored per-user and merged with defaults on read
- **Export/Import**: The `exportData` endpoint returns the complete user dataset (activities, categories, preferences) as a single JSON payload; `importData` replaces it atomically
- **Activity editing**: `PUT /api/activities/:id` replaces the complete stored
  record. Omitting an optional field clears it; it does not preserve an old value.
- **Rename/Merge**: Renaming preserves category membership. An existing target name
  requires an explicit merge confirmation showing its category and the affected
  entry count. A merge retains all entry IDs, dates, and details, adopts the target
  name's membership, and removes only the source name. No entries are deduplicated.
  The server rejects a merge if the confirmed target name or category has changed.
- **Names and identities**: Category display names are trimmed on creation, editing,
  and restore; spaces inside a multiword name are preserved. Existing activity
  names and category IDs are exact identities, including those in older backups.
  Matching a potential merge target ignores surrounding whitespace and case, but
  never changes which source history or canonical target the user selected.

### State Management

- **Server state**: TanStack React Query manages all API data with automatic caching, background refetching, and cache invalidation on mutations
- **Client state**: React Router loaders pre-fetch data, client actions handle mutations (edit, delete, bulk ops) via `useFetcher`
- **UI state**: Component-local state with `useState`; theme preference synced to `<html>` class for Tailwind dark mode

## Testing

The frontend uses **[Storybook's test addon](https://storybook.js.org/docs/writing-tests)** as the primary testing strategy — stories with `play` functions serve as both living documentation and executable tests. This approach provides [component-level testing](https://storybook.js.org/docs/writing-tests/component-testing) that runs in a real browser, striking the right balance between the isolation of unit tests and the confidence of end-to-end tests.

- Stories are run as **Vitest tests** via `@storybook/addon-vitest`, executing in a real Chromium browser through `@vitest/browser-playwright`
- **MSW (Mock Service Worker)** is used extensively to mock all API responses at the network level, providing realistic test data without a backend. MSW handlers cover all 19 API endpoints with representative datasets
- API tests use **Vitest** with an in-memory Firebase mock for fast, isolated database operation testing
- Regression coverage follows export -> upload -> restore and edit -> save -> read,
  rather than treating a success toast or closed dialog as proof of persistence.
  The Firebase adapter scenarios include cold-cache null snapshots, transaction
  retries, failed commits, and omitted empty arrays. A null first callback is not
  proof of missing data. Transaction callbacks abort on domain errors and rethrow
  after settlement; throwing directly during an SDK retry can escape its promise.
- Backup and name-identity regressions use actual Firebase SDK snapshots with
  networking disabled, so numeric-key arrays and omitted empty arrays are not
  approximated by plain JSON mocks. These fixtures use explicit Node built-ins
  rather than browser globals. Server acknowledgements and retry races are still
  simulated; this is not a live Firebase/emulator test suite.

```bash
cd client && bun run test      # Storybook play function tests via Vitest + Playwright
cd api && bun run test          # API unit tests (Vitest)
cd client && bun run storybook  # Start Storybook on :6006 for interactive development
```

## Project Structure

```text
/client                     React frontend (Vite + React Router)
  /src/app                  Routes, root layout, global CSS
  /src/components           Reusable components (ui/, forms/, navigation/, etc.)
  /src/pages                Page components (Welcome, Charts, Compare, Settings)
  /src/data                 React Query hooks, query options, types
  /src/auth                 Firebase auth context and service
  /src/mocks                MSW handlers and Storybook decorators
  /src/utils                Helpers (colors, icons, cn)
/api                        Azure Functions backend
  /functions                Individual function endpoints (19 functions)
  /database                 Firebase DB abstraction layer with enrichment logic
  /utils                    Shared types, validators, rate limiter
/scripts                    Migration and utility scripts
```

## Development

### Building

React components are optimized by Oxc's native React Compiler
(`oxc-transform-react`). It is experimental and pinned deliberately. A shared
Vite plugin applies it to client code in both the app and Storybook, leaving JSX
and Fast Refresh to their existing framework plugins. Babel may remain as a
transitive framework dependency, but is not our React Compiler implementation.

```bash
bun run --filter '*' build      # Build both frontend and API
bun run --cwd client typecheck  # Generate route types, then tsc --noEmit
bun run --cwd api typecheck     # tsc --noEmit (requires Firebase config)
```

Client production, end-to-end and Storybook builds run the client typecheck
first and stop on errors. CI also checks the client explicitly before tests;
the deployment job checks the API after supplying its Firebase configuration.
Development servers rely on editor TypeScript diagnostics rather than a Vite
type-checking overlay.

### Linting & Formatting

```bash
bun run lint                    # Oxlint with zero warnings
bun run lint:fix                 # Apply safe lint fixes
bun run format                  # Format with Oxfmt
bun run format:check            # Check formatting without writing
```

Oxlint's recommended type-aware checks cover both workspaces. Oxlint and Oxfmt
run automatically on staged files via `lint-staged` + the Husky pre-commit hook,
followed by a whole-project typed lint pass. Native rules cover TypeScript,
React, and React Compiler; Storybook rules run through Oxlint's JS plugin API
rather than a second linter. React deprecations use native type-aware checking,
and component/hook factory checks use native `react/static-components`.

VS Code users should install the workspace's recommended Oxc and TypeScript
Native extensions for matching formatting, linting, and TypeScript 7 diagnostics.

## Deployment

The app is deployed on **Azure Static Web Apps** with CI/CD via GitHub Actions (`.github/workflows/azure-static-web-apps.yml`).

### Pipeline

1. **Install** — `bun install`
2. **Firebase config** — Decodes `API_FIREBASE_CONFIG` secret into `api/firebase/firebaseConfig.json`
3. **Typecheck** — `bun run --filter api typecheck`
4. **Build** — `bun run --filter '*' build` (client → `client/build/client`, API → `api/dist`)
5. **Deploy** — Uses `@azure/static-web-apps-cli` to deploy:
   - Push to `main` → **production** environment
   - Pull requests → **preview** environment (auto-created, auto-destroyed on PR close)

### Azure SWA Configuration

- Static content served from `client/build/client`
- API functions served from `api/dist` (Node.js 22)
- `/api/*` routes automatically routed to the Functions backend by Azure SWA — no proxy or routing config needed in production
