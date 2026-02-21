import type { QueryClient } from "@tanstack/react-query";

/**
 * TestContext manages shared state for Storybook tests.
 *
 * This exists because React Router actions run outside of React's component tree,
 * so they can't use React context or hooks. The mock actions in preview.ts need
 * access to the QueryClient to invalidate queries after mutations.
 *
 * The flow is:
 * 1. withAllProviders decorator creates QueryClient and calls testContext.setQueryClient()
 * 2. Story renders with that QueryClient via QueryClientProvider
 * 3. User interaction triggers useFetcher.submit()
 * 4. Mock action in preview.ts calls fetch() to hit MSW handlers
 * 5. Mock action calls testContext.invalidateActivities() to refetch data
 */
class TestContext {
  private _queryClient: QueryClient | null = null;

  setQueryClient(client: QueryClient) {
    this._queryClient = client;
  }

  getQueryClient(): QueryClient | null {
    return this._queryClient;
  }

  async invalidateActivities() {
    if (this._queryClient) {
      await this._queryClient.invalidateQueries({ queryKey: ["activities"] });
      await this._queryClient.invalidateQueries({
        queryKey: ["activitiesWithLimit"],
      });
    }
  }

  async invalidateCategories() {
    if (this._queryClient) {
      await this._queryClient.invalidateQueries({ queryKey: ["categories"] });
    }
  }
}

export const testContext = new TestContext();
