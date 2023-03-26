import { createContext, useContext } from "react";

export type User = {
  displayName: string | null;
  email: string | null;
  photoURL: string | null;
  uid: string;
};

export type Auth = {
  signOut: ((_event?: unknown) => Promise<void>) | undefined;
  getIdToken: (() => Promise<string>) | undefined;
  user: User | undefined;
};

export const AuthContext = createContext<Auth>({
  signOut: undefined,
  getIdToken: undefined,
  user: undefined,
});

export function useAuthContext(): Auth {
  return useContext(AuthContext);
}
