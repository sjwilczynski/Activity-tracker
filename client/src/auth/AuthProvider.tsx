import type { ReactNode } from "react";
import { AuthContext } from "./AuthContext";
import { Login } from "./Login";
import { useAuth } from "./useAuth";

export const AuthProvider = (props: { children: ReactNode }) => {
  const { isSignedIn, signOut, getIdToken, user } = useAuth();

  if (!isSignedIn) {
    return <Login />;
  } else {
    return (
      <AuthContext.Provider
        value={{
          signOut,
          getIdToken,
          user,
        }}
      >
        {props.children}
      </AuthContext.Provider>
    );
  }
};
