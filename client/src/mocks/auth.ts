import { fn } from "storybook/test";
import type { User } from "../auth/AuthContext";
import type { AuthAdapter } from "../auth/types";

export const mockUser: User = {
  displayName: "Test User",
  email: "test@example.com",
  photoURL: null,
  uid: "test-user-123",
};

export const authActions = {
  signInWithGoogle: fn(async () => {}),
  signInWithEmail: fn<(email: string, password: string) => Promise<void>>(
    async () => {}
  ),
  signUp: fn<(email: string, password: string) => Promise<void>>(
    async () => {}
  ),
};

export function createStoryAuth(user: User | null): AuthAdapter {
  return {
    waitForAuth: async () => {},
    getUser: () => user,
    onAuthStateChanged: (callback) => {
      callback(user);
      return () => {};
    },
    getIdToken: async () => "mock-token-12345",
    signOut: async () => {},
    ...authActions,
  };
}
