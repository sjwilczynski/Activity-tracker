import type { QueryClient } from "@tanstack/react-query";

/** Shares the rendered story's cache with production actions outside React. */
class TestContext {
  private queryClient: QueryClient | null = null;

  setQueryClient(client: QueryClient) {
    this.queryClient = client;
  }

  getQueryClient(): QueryClient | null {
    return this.queryClient;
  }
}

export const testContext = new TestContext();
