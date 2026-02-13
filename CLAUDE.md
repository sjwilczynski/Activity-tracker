# Activity Tracker

Sports activity tracking web app (React + Azure Functions + Firebase).

## Quick Start

```bash
bun install    # Install dependencies
bun run dev    # Start frontend (:3000) and API (:7071)
cd client && bun run test  # Run frontend tests
cd client && bun run storybook  # Start storybook
bun run --filter '*' build  # Build both frontend and API
```

## Structure

- `/client` - React frontend (Vite, shadcn/ui + Tailwind CSS, React Query)
- `/api` - Azure Functions backend

## Architecture

- Frontend proxies `/api/*` requests to backend (:7071)
- Firebase handles auth (client) and database (API via Admin SDK)
- React Query manages server state and caching
- API functions: CRUD for activities and categories
- UI components live in `client/src/components/ui/` (shadcn primitives — no separate Storybook stories or tests needed for these)

### Testing

In the `/client` folder we rely on Storybook with play functions for component testing and interaction testing, testing addon allows us to run them as vitest tests.

In the `/api` folder we use vitest for unit testing the utils related to functions.

All newly added code should include respective tests.

## Special Notes

Whenever something is changed that would affect the correctness of notes in `CLAUDE.md`, please update those notes as well. Whenever mistake is made, add a note about the mistake and how to avoid it in the future.

## Planning

Plans should be concise, in case of lack of enough information, ask for more details.
