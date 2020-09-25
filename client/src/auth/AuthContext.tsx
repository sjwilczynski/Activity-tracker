import * as React from "react";

export type User = {
  displayName: string | null;
  email: string | null;
  photoURL: string | null;
  uid: string;
};

export type Auth = {
  signOut: (() => Promise<void>) | undefined;
  getIdToken: (() => Promise<string>) | undefined;
  user: User | undefined;
};

export const AuthContext = React.createContext<Auth>({
  signOut: undefined,
  getIdToken: undefined,
  user: undefined,
});

export function useAuthContext(): Auth {
  return React.useContext(AuthContext);
}
