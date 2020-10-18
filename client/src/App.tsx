import * as React from "react";
import { AuthProvider } from "./auth";
import { ReactQueryDevtools } from "react-query-devtools";
import { BrowserRouter } from "react-router-dom";
import { QueryConfigProvider, useActivitiesPrefetch } from "./data";
import {
  AppContainer,
  Navigation,
  StylesProvider,
  PickersContextProvider,
  useNavigationState,
} from "./components";
import { Pages } from "./pages";

function App() {
  useActivitiesPrefetch();
  const { isNavigationOpen, handleNavigationToggle } = useNavigationState();
  return (
    <AppContainer handleNavigationToggle={handleNavigationToggle}>
      <Navigation
        isNavigationOpen={isNavigationOpen}
        handleNavigationToggle={handleNavigationToggle}
      />
      <Pages />
    </AppContainer>
  );
}

function AppWithProviders() {
  return (
    <AuthProvider>
      <QueryConfigProvider>
        <PickersContextProvider>
          <BrowserRouter>
            <StylesProvider>
              <App />
              <ReactQueryDevtools initialIsOpen={false} />
            </StylesProvider>
          </BrowserRouter>
        </PickersContextProvider>
      </QueryConfigProvider>
    </AuthProvider>
  );
}

export default AppWithProviders;
