import { AuthProvider } from "./auth";
import { ReactQueryDevtools } from "react-query/devtools";
import { BrowserRouter } from "react-router-dom";
import { QueryConfigProvider } from "./data";
import {
  AppContainer,
  StylesProvider,
  PickersContextProvider,
} from "./components";
import { Pages } from "./pages";
import { Provider } from "jotai";

function App() {
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
      <Provider>
        <PickersContextProvider>
          <BrowserRouter>
            <StylesProvider>
              <App />
              <ReactQueryDevtools initialIsOpen={false} />
            </StylesProvider>
          </BrowserRouter>
        </PickersContextProvider>
      </Provider>
    </QueryConfigProvider>
  );
}

export default AppWithProviders;
