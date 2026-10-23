import type { User } from "../auth/AuthContext";
import type { AuthAdapter } from "../auth/types";

export const testUser: User = {
  uid: "alice",
  displayName: "Alice",
  email: "alice@example.test",
  photoURL: null,
};

export function requestUrl(input: RequestInfo | URL): string {
  return typeof input === "string"
    ? input
    : input instanceof URL
      ? input.href
      : input.url;
}

export function createTestAuth(
  initialUser: User | null = testUser,
  delayed = false
) {
  let user = initialUser;
  let initialized = !delayed;
  let resolve!: () => void;
  const initialization = delayed
    ? new Promise<void>((done) => {
        resolve = done;
      })
    : Promise.resolve();
  const listeners = new Set<(user: User | null) => void>();
  const auth: AuthAdapter = {
    getUser: () => user,
    waitForAuth: () => initialization,
    onAuthStateChanged: (callback) => {
      listeners.add(callback);
      if (initialized) callback(user);
      return () => {
        listeners.delete(callback);
      };
    },
    getIdToken: async () => `${user?.uid}-token`,
    signOut: async () => {
      setUser(null);
    },
    signInWithGoogle: async () => {
      setUser(testUser);
    },
    signInWithEmail: async () => {
      setUser(testUser);
    },
    signUp: async () => {
      setUser(testUser);
    },
  };
  function setUser(next: User | null) {
    user = next;
    initialized = true;
    resolve?.();
    for (const listener of listeners) listener(user);
  }
  return { auth, setUser, listenerCount: () => listeners.size };
}
