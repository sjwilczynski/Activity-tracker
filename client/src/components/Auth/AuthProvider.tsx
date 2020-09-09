import React, { useState, useEffect, ReactNode } from "react";
import StyledFirebaseAuth from "react-firebaseui/StyledFirebaseAuth";
import firebase from "firebase/app";
import "firebase/auth";
import { AuthContext } from "./AuthContext";
import config from "./config.json";

firebase.initializeApp(config);

export const AuthProvider = (props: { children: ReactNode }) => {
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

  // Configure FirebaseUI.
  const uiConfig = {
    // Popup signin flow rather than redirect flow.
    signInFlow: "popup",
    // We will display Google and Facebook as auth providers.
    signInOptions: [firebase.auth.GoogleAuthProvider.PROVIDER_ID],
    callbacks: {
      // Avoid redirects after sign-in.
      signInSuccessWithAuthResult: () => false,
    },
  };

  if (!isSignedIn) {
    return (
      <div>
        <h1>My App</h1>
        <p>Please sign-in:</p>
        <StyledFirebaseAuth uiConfig={uiConfig} firebaseAuth={auth} />
      </div>
    );
  } else {
    const {
      displayName,
      email,
      photoURL,
      uid,
    } = auth.currentUser as firebase.User;
    return (
      <AuthContext.Provider
        value={{
          signOut: auth.signOut,
          getIdToken: auth.currentUser?.getIdToken,
          user: { displayName, email, photoURL, uid },
        }}
      >
        {props.children}
      </AuthContext.Provider>
    );
  }
};
