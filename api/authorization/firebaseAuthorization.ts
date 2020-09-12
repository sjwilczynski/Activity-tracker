import admin, { newConfig } from "../firebase/firebase";

export const firebaseGetUserId = async (token: string) => {
  try {
    const decodedToken = await admin.auth().verifyIdToken(token);
    return decodedToken.uid;
  } catch (err) {
    throw new Error(
      "Unable to identify the user. " +
        err.message +
        " Token:" +
        token +
        " " +
        newConfig
    );
  }
};
