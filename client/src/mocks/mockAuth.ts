import { authService } from "../auth/authService";

const mockUser = {
  displayName: "Test User",
  email: "test@example.com",
  photoURL: null,
  uid: "test-user-e2e",
};

/**
 * Patches authService singleton to behave as if a user is signed in.
 * Must be called before the app renders (before route loaders run).
 */
export function enableMockAuth() {
  Object.assign(authService, {
    isSignedIn: () => true,
    getUser: () => mockUser,
    getIdToken: async () => "mock-token-e2e",
    waitForAuth: async () => {},
    signOut: async () => {},
    onAuthStateChanged: (callback: (user: typeof mockUser | null) => void) => {
      callback(mockUser);
      return () => {};
    },
  });
}
