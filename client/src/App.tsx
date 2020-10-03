import * as React from "react";
import { AuthProvider } from "./auth/AuthProvider";
import { QueryConfigProvider } from "./data/react-query-config/QueryConfigProvider";
import { ReactQueryDevtools } from "react-query-devtools";
import { Profile } from "./pages/Profile";
import { Charts } from "./pages/Charts";
import { ActivityList } from "./pages/ActivityList";
import { useActivitiesPrefetch } from "./data/hooks/useActivities";

function App() {
  useActivitiesPrefetch();
  return (
    <>
      <Profile />
      <Charts />
      <ActivityList />
    </>
  );
}

function AppWithProviders() {
  return (
    <AuthProvider>
      <QueryConfigProvider>
        <App />
        <ReactQueryDevtools initialIsOpen={false} />
      </QueryConfigProvider>
    </AuthProvider>
  );
}

export default AppWithProviders;
