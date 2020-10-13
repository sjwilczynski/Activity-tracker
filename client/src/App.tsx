import * as React from "react";
import { AuthProvider } from "./auth";
import { ReactQueryDevtools } from "react-query-devtools";
import { BrowserRouter, Switch, Route } from "react-router-dom";
import { QueryConfigProvider, useActivitiesPrefetch } from "./data";
import { Navigation, PageNotFound, UIProvider } from "./components";
import { Welcome, Profile, Charts, ActivityList } from "./pages";

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
        <UIProvider>
          <App />
          <ReactQueryDevtools initialIsOpen={false} />
        </UIProvider>
      </QueryConfigProvider>
    </AuthProvider>
  );
}

export default AppWithProviders;
