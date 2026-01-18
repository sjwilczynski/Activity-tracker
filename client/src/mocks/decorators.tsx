import type { Decorator } from "@storybook/react-vite";
import { QueryClient, QueryClientProvider } from "react-query";
import { MemoryRouter } from "react-router-dom";
import { Provider } from "jotai";
import { AuthContext, type User, type Auth } from "../auth/AuthContext";
import { PickersContextProvider } from "../components/PickersContextProvider";
import { StylesProvider } from "../components/styles/StylesProvider";

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
        cacheTime: 0,
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

// Full app decorator with all providers (replicates App.tsx hierarchy)
export const withAllProviders: Decorator = (Story, context) => {
  const queryClient = createTestQueryClient();
  const initialEntries = context.parameters?.router?.initialEntries || ["/"];
  const user = context.parameters?.auth?.user ?? mockUser;

  return (
    <QueryClientProvider client={queryClient}>
      <Provider>
        <PickersContextProvider>
          <MemoryRouter initialEntries={initialEntries}>
            <StylesProvider>
              <AuthContext.Provider value={createMockAuthContext(user)}>
                <Story />
              </AuthContext.Provider>
            </StylesProvider>
          </MemoryRouter>
        </PickersContextProvider>
      </Provider>
    </QueryClientProvider>
  );
};
