import type { QueryClient } from "@tanstack/react-query";
import type { AuthAdapter } from "../auth/types";
import type { GetAuthToken } from "../data/apiClient";

export type RouterContext = {
  queryClient: QueryClient;
  authService: AuthAdapter;
  getAuthToken: GetAuthToken;
};
