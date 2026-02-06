import { initializeApp } from "firebase/app";
import {
  type User as FirebaseUser,
  getAuth,
  onAuthStateChanged,
  signOut,
} from "firebase/auth";
import type { User } from "./AuthContext";
import config from "./firebaseConfig.json";

const app = initializeApp(config);

type AuthStateCallback = (user: User | null) => void;

class AuthService {
  private auth = getAuth(app);
  private currentUser: FirebaseUser | null = null;
  private authInitialized = false;
  private authInitPromise: Promise<void>;
  private authInitResolve!: () => void;
  private subscribers: Set<AuthStateCallback> = new Set();

  constructor() {
    this.authInitPromise = new Promise((resolve) => {
      this.authInitResolve = resolve;
    });

    onAuthStateChanged(this.auth, (user) => {
      this.currentUser = user;
      if (!this.authInitialized) {
        this.authInitialized = true;
        this.authInitResolve();
      }
      // Notify subscribers
      const userData = user ? this.mapUser(user) : null;
      this.subscribers.forEach((callback) => callback(userData));
    });
  }

  private mapUser(user: FirebaseUser): User {
    const { displayName, email, photoURL, uid } = user;
    return { displayName, email, photoURL, uid };
  }

  isSignedIn(): boolean {
    return this.currentUser !== null;
  }

  getUser(): User | null {
    return this.currentUser ? this.mapUser(this.currentUser) : null;
  }

  async getIdToken(): Promise<string> {
    if (!this.currentUser) {
      throw new Error("Not authenticated");
    }
    return this.currentUser.getIdToken();
  }

  async waitForAuth(): Promise<void> {
    return this.authInitPromise;
  }

  async signOut(): Promise<void> {
    return signOut(this.auth);
  }

  onAuthStateChanged(callback: AuthStateCallback): () => void {
    this.subscribers.add(callback);
    // Immediately call with current state if auth is initialized
    if (this.authInitialized) {
      const userData = this.currentUser ? this.mapUser(this.currentUser) : null;
      callback(userData);
    }
    // Return unsubscribe function
    return () => {
      this.subscribers.delete(callback);
    };
  }
}

// Export singleton instance
export const authService = new AuthService();
