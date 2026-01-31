import firebase from "firebase/compat/app";
import "firebase/compat/auth";
import { useCallback, useEffect, useState } from "react";
import type { User } from "./AuthContext";
import config from "./firebaseConfig.json";

firebase.initializeApp(config);

export const useAuth = () => {
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [currentUser, setCurentUser] = useState<firebase.User | undefined>(
    undefined
  );
  const auth = firebase.auth();

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

const getUser = (user: firebase.User): User => {
  const { displayName, email, photoURL, uid } = user;
  return { displayName, email, photoURL, uid };
};
