![Azure Static Web Apps CI/CD](https://github.com/sjwilczynski/Activity-tracker/workflows/Azure%20Static%20Web%20Apps%20CI/CD/badge.svg?branch=main)

# Activity Tracker

A sports activity tracking web app for logging workouts, comparing performance across time periods, and visualizing trends. Built with a React frontend, Azure Functions API, and Firebase for authentication and data storage.

## Screenshots

<!-- TODO: add screenshots -->
<!-- Dashboard (light + dark) -->
<!-- Activity List (light + dark) -->
<!-- Charts (light + dark) -->
<!-- Compare (light + dark) -->
<!-- Settings (light + dark) -->

## Tech Stack

- **Frontend:** React 19, TypeScript, Tailwind CSS v4, shadcn/ui, React Router v7, React Query, Chart.js
- **Backend:** Azure Functions (Node.js)
- **Auth & Database:** Firebase Auth (client-side), Firebase Realtime Database (API via Admin SDK)
- **Hosting:** Azure Static Web Apps

## Quick Start

```bash
bun install    # Install dependencies
bun run dev    # Start frontend (:3000) and API (:7071)
```

## Architecture

The app is split into a client-side React SPA and a serverless API layer:

- **Client** communicates with the API by proxying `/api/*` requests to the backend (port 7071).
- **Firebase Auth** handles user authentication on the client; the API uses the Firebase Admin SDK to verify tokens and access the Realtime Database.
- **React Query** manages server state and caching on the frontend.
- **API functions** provide CRUD operations for activities and categories.

## Project Structure

```text
/client  - React frontend (Vite, shadcn/ui + Tailwind CSS, React Query)
/api     - Azure Functions backend
/scripts - Migration and utility scripts
```

## Development

### Testing

```bash
cd client && bun run test      # Storybook play function tests via vitest
cd api && bun run test          # API unit tests
```

### Storybook

```bash
cd client && bun run storybook  # Start Storybook
```

### Building

```bash
bun run --filter '*' build      # Build both frontend and API
```

### Linting

```bash
bun run lint
```

## Deployment

The app is deployed via **Azure Static Web Apps** with CI/CD powered by GitHub Actions. Pushing to `main` triggers a production deployment; pull requests automatically get preview environments.
