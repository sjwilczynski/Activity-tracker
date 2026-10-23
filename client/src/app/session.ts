import { QueryClient } from "@tanstack/react-query";
import type { AuthAdapter } from "../auth/types";

export function createSession(auth: AuthAdapter) {
  const user = auth.getUser();
  const uid = user?.uid ?? null;
  let active = true;
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { staleTime: 10 * 60_000, gcTime: 10 * 60_000 },
      mutations: { retry: false },
    },
  });
  const assertCurrent = () => {
    if (!active || (auth.getUser()?.uid ?? null) !== uid) {
      throw new Error("Session retired");
    }
  };
  const getAuthToken = async () => {
    assertCurrent();
    if (!uid) throw new Error("Not authenticated");
    const token = await auth.getIdToken();
    assertCurrent();
    return token;
  };
  const authService: AuthAdapter = {
    getUser: () => {
      assertCurrent();
      return auth.getUser();
    },
    waitForAuth: async () => {
      assertCurrent();
      await auth.waitForAuth();
      assertCurrent();
    },
    getIdToken: getAuthToken,
    onAuthStateChanged: (callback) => auth.onAuthStateChanged(callback),
    signOut: async () => {
      assertCurrent();
      await auth.signOut();
    },
    signInWithGoogle: async () => {
      assertCurrent();
      await auth.signInWithGoogle();
    },
    signInWithEmail: async (email, password) => {
      assertCurrent();
      await auth.signInWithEmail(email, password);
    },
    signUp: async (email, password) => {
      assertCurrent();
      await auth.signUp(email, password);
    },
  };
  return {
    user,
    queryClient,
    assertCurrent,
    authService,
    getAuthToken,
    dispose: () => {
      active = false;
      void queryClient.cancelQueries();
      queryClient.clear();
    },
  };
}
