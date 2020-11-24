import { AuthProvider } from "./auth";
import { ReactQueryDevtools } from "react-query-devtools";
import { BrowserRouter } from "react-router-dom";
import { QueryConfigProvider, useActivitiesPrefetch } from "./data";
import {
  AppContainer,
  StylesProvider,
  PickersContextProvider,
} from "./components";
import { Pages } from "./pages";

function App() {
  useActivitiesPrefetch();
  return (
    <AppContainer>
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
