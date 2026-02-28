import {
  signOut as firebaseSignOut,
  type User as FirebaseUser,
  getAuth,
  onAuthStateChanged,
} from "firebase/auth";
import { useEffect, useState } from "react";
import type { User } from "./AuthContext";

export const useAuth = () => {
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState<FirebaseUser | undefined>(
    undefined
  );
  const auth = getAuth();

  useEffect(() => {
    const unregisterAuthObserver = onAuthStateChanged(auth, (user) => {
      if (user) {
        setCurrentUser(user);
        setIsSignedIn(true);
      } else {
        setCurrentUser(undefined);
        setIsSignedIn(false);
      }
    });
    return () => {
      unregisterAuthObserver();
    };
  }, [auth, isSignedIn, currentUser]);

  const getIdTokenFun = currentUser
    ? () => currentUser.getIdToken()
    : undefined;

  const signOut = () => {
    return firebaseSignOut(auth);
  };

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
