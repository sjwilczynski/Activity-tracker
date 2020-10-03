import * as React from "react";
import { AuthProvider } from "./auth/AuthProvider";
import { QueryConfigProvider } from "./data/react-query-config/QueryConfigProvider";
import { ReactQueryDevtools } from "react-query-devtools";
import { Profile } from "./pages/Profile";
import { Charts } from "./pages/Charts";
import { ActivityList } from "./pages/ActivityList";
import { BrowserRouter, Switch, Route } from "react-router-dom";
import { Navigation } from "./components/navigation/Navigation";
import { PageNotFound } from "./components/navigation/PageNotFound";
import { Welcome } from "./pages/Welcome";
import { useActivitiesPrefetch } from "./data/hooks/useActivities";

function App() {
  useActivitiesPrefetch();
  return (
    <BrowserRouter>
      <Navigation />
      <Switch>
        <Route exact path="/" component={Welcome} />
        <Route exact path="/profile" component={Profile} />
        <Route exact path="/charts" component={Charts} />
        <Route exact path="/activity-list" component={ActivityList} />
        <Route path="/" component={PageNotFound} />
      </Switch>
    </BrowserRouter>
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
