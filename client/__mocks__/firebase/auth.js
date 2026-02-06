import { fn } from "storybook/test";

export const getAuth = fn().mockName("getAuth").mockReturnValue({});

export const signInWithPopup = fn()
  .mockName("signInWithPopup")
  .mockResolvedValue({ user: { uid: "mock-uid" } });

export const signInWithEmailAndPassword = fn()
  .mockName("signInWithEmailAndPassword")
  .mockResolvedValue({ user: { uid: "mock-uid" } });

export const createUserWithEmailAndPassword = fn()
  .mockName("createUserWithEmailAndPassword")
  .mockResolvedValue({ user: { uid: "mock-uid" } });

export const signOut = fn().mockName("signOut").mockResolvedValue(undefined);

export const onAuthStateChanged = fn()
  .mockName("onAuthStateChanged")
  .mockReturnValue(() => {});

export class GoogleAuthProvider {
  static PROVIDER_ID = "google.com";
}
