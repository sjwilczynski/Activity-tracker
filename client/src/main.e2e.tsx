import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { SessionHost } from "./app/SessionHost";
import type { User } from "./auth/AuthContext";
import type { AuthAdapter } from "./auth/types";
import "./app/globals.css";

const defaultUser: User = {
  uid: "test-user-e2e",
  displayName: "Test User",
  email: "test@example.com",
  photoURL: null,
};
let user: User | null =
  localStorage.getItem("e2e-signed-out") === "true" ? null : defaultUser;
const listeners = new Set<(user: User | null) => void>();
const setUser = (uid: string | null) => {
  user = uid ? { ...defaultUser, uid } : null;
  localStorage.setItem("e2e-signed-out", String(!user));
  for (const listener of listeners) listener(user);
};
const updateProfile = (displayName: string) => {
  if (!user) throw new Error("No E2E user to update");
  user = { ...user, displayName };
  for (const listener of listeners) listener(user);
};
const auth: AuthAdapter = {
  waitForAuth: async () => {},
  getUser: () => user,
  getIdToken: async () => {
    if (!user) throw new Error("Not authenticated");
    return `mock-token-${user.uid}`;
  },
  onAuthStateChanged: (callback) => {
    listeners.add(callback);
    callback(user);
    return () => {
      listeners.delete(callback);
    };
  },
  signOut: async () => {
    setUser(null);
  },
  signInWithGoogle: async () => {
    setUser(defaultUser.uid);
  },
  signInWithEmail: async () => {
    setUser(defaultUser.uid);
  },
  signUp: async () => {
    setUser(defaultUser.uid);
  },
};

declare global {
  // oxlint-disable-next-line typescript/consistent-type-definitions -- Extend the browser Window declaration for the E2E adapter.
  interface Window {
    __e2eAuth: { setUser: typeof setUser; updateProfile: typeof updateProfile };
  }
}
window.__e2eAuth = { setUser, updateProfile };
const root = document.getElementById("root");
if (!root) throw new Error("Application root is missing");
createRoot(root).render(
  <StrictMode>
    <SessionHost auth={auth} />
  </StrictMode>
);
