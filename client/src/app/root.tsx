import { QueryClient } from "@tanstack/react-query";
import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  isRouteErrorResponse,
  useRouteError,
} from "react-router";
import { authService } from "../auth/authService";
export { HydrateFallback } from "../components/states/HydrateFallback";

// Create QueryClient instance for the app
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      gcTime: 10 * 60 * 1000,
      staleTime: 10 * 60 * 1000,
    },
  },
});

// Load context for loaders and actions
export type LoadContext = {
  queryClient: QueryClient;
  getAuthToken: () => Promise<string>;
  authService: typeof authService;
};

const loadContext: LoadContext = {
  queryClient,
  getAuthToken: () => authService.getIdToken(),
  authService,
};

export function getLoadContext(): LoadContext {
  return loadContext;
}

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
        <link
          rel="icon"
          type="image/png"
          sizes="32x32"
          href="/favicon-32x32.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="16x16"
          href="/favicon-16x16.png"
        />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link
          rel="mask-icon"
          href="/android-chrome-192x192.png"
          color="#4479a2"
        />
        <link rel="manifest" href="/manifest.webmanifest" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css?family=Roboto:300,400,500,700&display=swap"
        />
        <title>Activity tracker</title>
        <meta
          name="description"
          content="Activity tracker is an app to track your sport related activities regularly."
        />
        <meta name="theme-color" content="#4479a2" />
        <style
          dangerouslySetInnerHTML={{
            __html:
              "html, body, #root { height: 100%; margin: 0; padding: 0; }",
          }}
        />
        <Meta />
        <Links />
      </head>
      <body>
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function App() {
  return <Outlet />;
}

export function ErrorBoundary() {
  const error = useRouteError();

  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>Error - Activity Tracker</title>
        <Meta />
        <Links />
      </head>
      <body>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            height: "100vh",
            padding: "1rem",
          }}
        >
          <h1>Application Error</h1>
          {isRouteErrorResponse(error) ? (
            <p>
              {error.status} {error.statusText}
            </p>
          ) : (
            <p>
              {error instanceof Error ? error.message : "Something went wrong"}
            </p>
          )}
          <a href="/">Return to Home</a>
        </div>
        <Scripts />
      </body>
    </html>
  );
}
