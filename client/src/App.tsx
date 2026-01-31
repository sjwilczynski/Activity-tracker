import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { Provider } from "jotai";
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "./auth";
import {
  AppContainer,
  PickersContextProvider,
  StylesProvider,
} from "./components";
import { QueryConfigProvider } from "./data";

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
