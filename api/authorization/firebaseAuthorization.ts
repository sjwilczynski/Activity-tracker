import admin from "../firebase/firebase";

export const firebaseGetUserId = async (
  token: string | undefined
): Promise<string> => {
  if (token === undefined) {
    throw new Error("Received no id token");
  }
  try {
    const decodedToken = await admin.auth().verifyIdToken(token);
    return decodedToken.uid;
  } catch (err) {
    throw new Error(`Unable to identify the user using token: ${token}`);
  }
};
