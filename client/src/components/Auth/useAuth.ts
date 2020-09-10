import { useState, useEffect } from "react";
import firebase from "firebase/app";
import "firebase/auth";
import { User } from "./AuthContext";
import config from "./config.json";

firebase.initializeApp(config);

export const useAuth = () => {
  const [isSignedIn, setIsSignedIn] = useState(false);
  const auth = firebase.auth();

  useEffect(() => {
    const unregisterAuthObserver = auth.onAuthStateChanged((user) => {
      if (user) {
        setIsSignedIn(true);
      } else {
        setIsSignedIn(false);
      }
    });
    return () => {
      unregisterAuthObserver();
    };
  }, [auth, isSignedIn]);

  return {
    isSignedIn,
    signOut: auth.signOut,
    getIdToken: auth.currentUser?.getIdToken,
    user: isSignedIn ? getCurrentUser(auth) : null,
  };
};

const getCurrentUser = (auth: firebase.auth.Auth): User => {
  const {
    displayName,
    email,
    photoURL,
    uid,
  } = auth.currentUser as firebase.User;
  return { displayName, email, photoURL, uid };
};
