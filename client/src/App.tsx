import * as React from "react";
import { AuthProvider } from "./auth";
import { ReactQueryDevtools } from "react-query-devtools";
import { BrowserRouter, Switch, Route } from "react-router-dom";
import { QueryConfigProvider, useActivitiesPrefetch } from "./data";
import { Navigation, PageNotFound } from "./components";
import { Welcome, Profile, Charts, ActivityList } from "./pages";
import { CssBaseline } from "@material-ui/core";

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
        <CssBaseline />
        <App />
        <ReactQueryDevtools initialIsOpen={false} />
      </QueryConfigProvider>
    </AuthProvider>
  );
}

export default AppWithProviders;
