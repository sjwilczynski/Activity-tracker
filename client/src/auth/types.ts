import type { User } from "./AuthContext";

export type AuthAdapter = {
  waitForAuth(): Promise<void>;
  getUser(): User | null;
  onAuthStateChanged(callback: (user: User | null) => void): () => void;
  getIdToken(): Promise<string>;
  signOut(): Promise<void>;
  signInWithGoogle(): Promise<void>;
  signInWithEmail(email: string, password: string): Promise<void>;
  signUp(email: string, password: string): Promise<void>;
};
