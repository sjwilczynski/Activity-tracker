# Migration Plan: Azure SWA + Functions + Firebase -> Next.js + Firebase + Vercel

This document outlines the tasks required to migrate the Activity Tracker application from its current Azure-based setup to a Next.js application hosted on Vercel, while continuing to use Firebase for the backend services.

## Phase 1: Setup and Basic Migration

- [ ] **1.1: Initialize Next.js Project:**
  - [ ] Set up a new Next.js project (using `create-next-app` with TypeScript and App Router) inside a new `next/` directory (sibling to `client/` and `api/`).
  - [ ] Configure ESLint, Prettier, and TypeScript settings compatible with the existing setup within the `next/` directory.
  - [ ] Set up App Router project structure within `next/` (e.g., `next/src/app`, `next/src/components`, etc.).
- [ ] **1.2: Integrate Firebase:**
  - [ ] Add Firebase JS SDK (`firebase`) to the Next.js project (`next/package.json`).
  - [ ] Set up Firebase client-side initialization (`firebase/app`).
  - [ ] Configure environment variables for Firebase client config (use Vercel environment variables).
  - [ ] Add Firebase Admin SDK (`firebase-admin`) for server-side operations.
  - [ ] Configure environment variables for Firebase Admin SDK (service account key - manage securely via Vercel).
- [ ] **1.3: Set up Vercel Deployment:**
  - [ ] Create a new Vercel project linked to the repository.
  - [ ] Configure build settings and environment variables in Vercel.
  - [ ] Set up initial deployment pipeline.

## Phase 2: Frontend Migration (React Client -> Next.js)

_(Refer to the official Next.js Vite migration guide for detailed steps: https://nextjs.org/docs/app/guides/migrating/from-vite)_

- [ ] **2.1: Migrate Core Layout and Routing:**
  - [ ] Replicate the main application layout using Next.js App Router layout conventions (`app/layout.tsx`).
  - [ ] Migrate routing logic from `react-router-dom` to Next.js App Router file-system routing.
  - [ ] Adapt Material UI setup (`@mui/material`) for Next.js App Router (follow official MUI App Router guide).
- [ ] **2.2: Migrate Authentication:**
  - [ ] **Remove `firebaseui` dependency.**
  - [ ] Implement Firebase Authentication using Firebase JS SDK v9+ (`firebase/auth`) within the Next.js app (Refer to `friendlyeats-web` Next.js example: https://github.com/firebase/friendlyeats-web/blob/master/nextjs-end/src).
  - [ ] Create custom UI components for login/logout/signup flows.
  - [ ] Handle authentication state management (potentially using Jotai or React Context).
  - [ ] Set up server-side session management or token handling if needed (NextAuth.js could be an option, but direct Firebase token validation is also viable).
- [ ] **2.3: Migrate Components and Pages:**
  - [ ] Port existing React components from `client/src` to the Next.js structure.
  - [ ] Adapt components to Next.js App Router patterns (Server Components, Client Components).
  - [ ] Update data fetching logic:
    - Replace direct API calls to Azure Functions with calls to Next.js App Router API Routes or Server Actions.
    - Adapt `react-query` usage for Next.js App Router (caching, server-side fetching with Server Components).
  - [ ] Migrate form logic (Formik, `formik-mui`).
  - [ ] Migrate charting components (`react-chartjs-2`).
- [ ] **2.4: Migrate State Management:**
  - [ ] Review Jotai (`jotai`) usage and ensure it works correctly within the Next.js architecture (Client Components).
  - [ ] Assess if any state can be moved to URL state or server-managed state via React Query/Server Components.
- [ ] **2.5: Styling and Assets:**
  - [ ] Ensure Material UI styles and theming are correctly applied.
  - [ ] Migrate any static assets (images, fonts) to the Next.js `public` directory or handle imports appropriately.
- [ ] **2.6: Migrate PWA Configuration:**
  - [ ] Migrate PWA setup from `vite-plugin-pwa` to Next.js.
  - [ ] Configure `manifest.json` using Next.js Metadata API or static file in `app/` to enable installation.
  - [ ] (Optional/Deferred) Set up a service worker (`sw.js`) for offline capabilities/push notifications.
  - [ ] Refer to Next.js PWA guide for manifest setup: https://nextjs.org/docs/app/guides/progressive-web-apps

## Phase 3: Backend Migration (Azure Functions -> Next.js API Routes / Server Actions)

- [ ] **3.1: Analyze Azure Functions:**
  - [ ] List all existing Azure Functions in the `api/` directory.
  - [ ] Document the purpose, triggers, inputs, and outputs of each function.
  - [ ] Identify Firebase Admin SDK usage patterns (Firestore reads/writes, auth validation, etc.).
- [ ] **3.2: Implement Next.js Backend Logic:**
  - [ ] Create corresponding Next.js App Router API Routes (`app/api/...`) or Server Actions for each Azure Function's functionality.
  - [ ] Port the core logic from Azure Functions to the new API Routes/Server Actions.
  - [ ] Implement Firebase Admin SDK interactions within these routes/actions.
  - [ ] Implement request validation (similar to how Azure Functions might handle it).
  - [ ] Implement authentication/authorization checks (validating Firebase ID tokens passed from the client).
- [ ] **3.3: Update Frontend Calls:**
  - [ ] Modify frontend components (where `react-query` or `fetch` is used) to call the new Next.js API Routes/Server Actions instead of the old Azure Function endpoints.

## Phase 4: Testing and Refinement

- [ ] **4.1: Unit and Integration Testing:**
  - [ ] Write/update unit tests for critical components and backend logic (App Router API Routes/Server Actions).
  - [ ] Perform integration testing for key user flows (login, data fetching, data submission).
- [ ] **4.2: End-to-End Testing:**
  - [ ] Conduct end-to-end tests on a Vercel preview deployment.
- [ ] **4.3: Performance Optimization:**
  - [ ] Analyze Next.js build outputs and runtime performance.
  - [ ] Optimize component rendering (Server vs. Client Components within App Router).
  - [ ] Optimize data fetching strategies using App Router features.
- [ ] **4.4: Security Review:**
  - [ ] Ensure secure handling of environment variables/secrets in Vercel.
  - [ ] Verify proper authentication and authorization enforcement on API Routes/Server Actions.
  - [ ] Check for common web vulnerabilities (XSS, CSRF etc.).

## Phase 5: Go-Live

- [ ] **5.1: Final Deployment:**
  - [ ] Merge migration branch to main/production branch.
  - [ ] Monitor Vercel deployment.
- [ ] **5.2: DNS Update (if applicable):**
  - [ ] Update DNS records to point the production domain to the Vercel deployment.
- [ ] **5.3: Decommission Azure Resources:**
  - [ ] After confirming Vercel deployment stability, plan the decommissioning of Azure Static Web App and Azure Functions resources.
  - [ ] Backup any necessary data or logs.
  - [ ] Delete Azure resources to avoid costs.

## Phase 6: Post-Migration

- [ ] **6.1: Monitoring:**
  - [ ] Set up monitoring and logging for the Next.js application on Vercel.
- [ ] **6.2: Documentation Update:**
  - [ ] Update project README and any other relevant documentation.
