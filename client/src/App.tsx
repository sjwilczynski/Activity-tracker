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
      <AuthProvider>
        <Pages />
      </AuthProvider>
    </AppContainer>
  );
}

function AppWithProviders() {
  return (
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
  );
}

export default AppWithProviders;
