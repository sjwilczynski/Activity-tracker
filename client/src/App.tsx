import { AuthProvider } from "./auth";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { BrowserRouter } from "react-router-dom";
import { QueryConfigProvider } from "./data";
import {
  AppContainer,
  StylesProvider,
  PickersContextProvider,
} from "./components";
import { Provider } from "jotai";

function AppWithProviders() {
  return (
    <QueryConfigProvider>
      <Provider>
        <PickersContextProvider>
          <BrowserRouter>
            <StylesProvider>
              <AuthProvider>
                <AppContainer />
              </AuthProvider>
              <ReactQueryDevtools initialIsOpen={false} />
            </StylesProvider>
          </BrowserRouter>
        </PickersContextProvider>
      </Provider>
    </QueryConfigProvider>
  );
}

export default AppWithProviders;
