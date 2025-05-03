import { useState, useEffect, useCallback } from "react";
import { initializeApp } from "firebase/app";
import { getAuth, type User as FirebaseUser } from "firebase/auth";
import type { User } from "./AuthContext";
import config from "./firebaseConfig.json";

initializeApp(config);

export const useAuth = () => {
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [currentUser, setCurentUser] = useState<FirebaseUser | undefined>(
    undefined
  );
  const auth = getAuth();

  useEffect(() => {
    const unregisterAuthObserver = auth.onAuthStateChanged((user) => {
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
    return auth.signOut();
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
