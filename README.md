[![Azure Static Web Apps CI/CD](https://github.com/sjwilczynski/Activity-tracker/actions/workflows/azure-static-web-apps.yml/badge.svg?branch=main)](https://github.com/sjwilczynski/Activity-tracker/actions/workflows/azure-static-web-apps.yml)

# Activity Tracker

A sports activity tracking web app for logging workouts, comparing performance across time periods, and visualizing trends with interactive charts. Built with a modern React stack, serverless Azure Functions API, and Firebase for authentication and real-time data storage.

## Features

- **Dashboard** — Quick activity logging, stat cards (total, last 7/30 days, last activity), and recent activity feed
- **Activity List** — Full activity history with search, pagination, month grouping, inline editing, and bulk operations (rename, reassign category, delete by category)
- **Charts** — Bar charts and pie charts for activity distribution, with group-by-category toggle and date range filtering
- **Compare** — Side-by-side comparison of activity periods (month vs month, year vs year) with trend line charts and metric cards
- **Settings** — Category and activity name management with drag-and-drop, import/export, and theme preferences
- **PWA** — Installable as a Progressive Web App with offline support via service worker
- **Dark mode** — System-aware dark/light theme toggle

## Screenshots

<!-- TODO: add screenshots -->
<!-- Dashboard (light + dark) -->
<!-- Activity List (light + dark) -->
<!-- Charts (light + dark) -->
<!-- Compare (light + dark) -->
<!-- Settings (light + dark) -->

## Tech Stack

### Frontend
- **React 19** with the new JSX transform (no `React` import needed) and ref-as-prop (no `forwardRef`)
- **TypeScript** with strict mode
- **React Router v7** with file-based routing, loaders, and client actions for mutations
- **TanStack React Query** for server state management, caching, and optimistic updates
- **TanStack Form** for form state and validation
- **Tailwind CSS v4** with `@tailwindcss/vite` plugin and CSS-first configuration
- **shadcn/ui** components built on Radix UI primitives
- **Chart.js** with `react-chartjs-2` for data visualization
- **Vite** as build tool with HMR, TypeScript checker, and PWA plugin
- **Storybook 10** with play functions for component and interaction testing
- **Lucide React** for icons, **Sonner** for toast notifications, **cmdk** for command palette, **date-fns** for date utilities

### Backend
- **Azure Functions** (Node.js 22) — serverless API with 19 CRUD functions for activities, categories, preferences, and bulk operations
- **Firebase Admin SDK** for token verification and Realtime Database access
- **Rate limiting** middleware per user

### Infrastructure
- **Firebase Auth** for client-side authentication (Google sign-in)
- **Firebase Realtime Database** as the primary data store
- **Azure Static Web Apps** for hosting with integrated API routing

## Quick Start

```bash
bun install    # Install dependencies
bun run dev    # Start frontend (:3000) and API (:7071)
```

## Architecture

The app is split into two workspaces: a client-side React SPA and a serverless API layer.

### Client → API Communication
- In **local development**, Vite proxies `/api/*` requests from the frontend (port 3000) to the Azure Functions backend (port 7071)
- In **production**, Azure Static Web Apps handles the routing natively — the client and API are deployed together, and `/api/*` requests are routed to the Functions backend automatically without any proxy

### Authentication Flow
- **Client**: Firebase Auth handles sign-in (Google provider). The auth state is managed via `AuthContext` and a route loader redirects unauthenticated users to `/login`
- **API**: Each function extracts the Firebase ID token from the `Authorization` header, verifies it via the Admin SDK, and uses the resulting `userId` to scope all database operations

### State Management
- **Server state**: TanStack React Query manages all API data with automatic caching, background refetching, and cache invalidation on mutations
- **Client state**: React Router loaders pre-fetch data, client actions handle mutations (edit, delete, bulk ops) via `useFetcher`
- **UI state**: Component-local state with `useState`; theme preference synced to `<html>` class for Tailwind dark mode

### Data Model
Activities are stored as flat records keyed by Firebase push IDs. Categories contain an `activityNames` array — the single source of truth for which activities belong to which category. The API enriches activities with computed `categoryId` and `active` fields on read.

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
  /functions                Individual function endpoints
  /database                 Firebase DB abstraction layer
  /utils                    Shared types, validators, rate limiter
/scripts                    Migration and utility scripts
```

## Development

### Testing

```bash
cd client && bun run test      # Storybook play function tests via Vitest + Playwright browser
cd api && bun run test          # API unit tests (Vitest)
```

Client tests use Storybook's test addon: stories with `play` functions run as Vitest tests in a real browser via `@vitest/browser-playwright`.

### Storybook

```bash
cd client && bun run storybook  # Start Storybook on :6006
```

### Building

```bash
bun run --filter '*' build      # Build both frontend and API
```

### Linting & Formatting

```bash
bun run lint                    # ESLint with --max-warnings=0
```

Prettier and ESLint run automatically on staged files via `lint-staged` + Husky pre-commit hook.

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
- `/api/*` routes automatically routed to the Functions backend
- Renovate branches are excluded from PR deployments
