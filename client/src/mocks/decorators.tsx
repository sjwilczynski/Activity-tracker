import type { Decorator } from "@storybook/react-vite";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Provider } from "jotai";
import { withRouter } from "storybook-addon-remix-react-router";
import { AuthContext, type Auth, type User } from "../auth/AuthContext";
import { PickersContextProvider } from "../components/PickersContextProvider";
import { StylesProvider } from "../components/styles/StylesProvider";
import { testContext } from "./testContext";

// Mock user for stories
export const mockUser: User = {
  displayName: "Test User",
  email: "test@example.com",
  photoURL: "https://via.placeholder.com/150",
  uid: "test-user-123",
};

// Create a fresh QueryClient for each story to avoid cache interference
const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0,
        staleTime: 0,
      },
    },
  });

// Mock auth context value
const createMockAuthContext = (user: User | undefined = mockUser): Auth => ({
  signOut: async () => {},
  getIdToken: async () => "mock-token-12345",
  user,
});

// Router decorator using storybook-addon-remix-react-router
export { withRouter };

// Full app decorator with all providers (replicates App.tsx hierarchy)
// Note: This decorator does not include router - use withRouter decorator separately
export const withAllProviders: Decorator = (Story, context) => {
  const queryClient = createTestQueryClient();
  testContext.setQueryClient(queryClient);
  const user = context.parameters?.auth?.user ?? mockUser;

  return (
    <QueryClientProvider client={queryClient}>
      <Provider>
        <PickersContextProvider>
          <StylesProvider>
            <AuthContext.Provider value={createMockAuthContext(user)}>
              <Story />
            </AuthContext.Provider>
          </StylesProvider>
        </PickersContextProvider>
      </Provider>
    </QueryClientProvider>
  );
};
