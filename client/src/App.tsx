import * as React from "react";
import { AuthProvider } from "./auth";
import { ReactQueryDevtools } from "react-query-devtools";
import { BrowserRouter } from "react-router-dom";
import { QueryConfigProvider, useActivitiesPrefetch } from "./data";
import { AppContainer, Navigation, UIProvider } from "./components";
import { Pages } from "./pages";

function App() {
  useActivitiesPrefetch();
  return (
    <AppContainer>
      <Navigation />
      <Pages />
    </AppContainer>
  );
}

function AppWithProviders() {
  return (
    <AuthProvider>
      <QueryConfigProvider>
        <UIProvider>
          <BrowserRouter>
            <App />
            <ReactQueryDevtools initialIsOpen={false} />
          </BrowserRouter>
        </UIProvider>
      </QueryConfigProvider>
    </AuthProvider>
  );
}

export default AppWithProviders;
