import {
  signOut as firebaseSignOut,
  type User as FirebaseUser,
  getAuth,
  onAuthStateChanged,
} from "firebase/auth";
import { useCallback, useEffect, useState } from "react";
import type { User } from "./AuthContext";

export const useAuth = () => {
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [currentUser, setCurentUser] = useState<FirebaseUser | undefined>(
    undefined
  );
  const auth = getAuth();

  useEffect(() => {
    const unregisterAuthObserver = onAuthStateChanged(auth, (user) => {
      if (user) {
        setCurentUser(user);
        setIsSignedIn(true);
      } else {
        setCurentUser(undefined);
        setIsSignedIn(false);
      }
    });
    return () => {
      unregisterAuthObserver();
    };
  }, [auth, isSignedIn, currentUser]);

  const getIdTokenFun = currentUser
    ? () => currentUser?.getIdToken()
    : undefined;

  const signOut = useCallback(() => {
    return firebaseSignOut(auth);
  }, [auth]);

  return {
    isSignedIn,
    signOut,
    getIdToken: currentUser ? getIdTokenFun : undefined,
    user: currentUser ? getUser(currentUser) : undefined,
  };
};

const getUser = (user: FirebaseUser): User => {
  const { displayName, email, photoURL, uid } = user;
  return { displayName, email, photoURL, uid };
};
