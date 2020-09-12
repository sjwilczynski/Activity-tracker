import admin from "../firebase/firebase";

export const firebaseGetUserId = async (tokenHeader: string) => {
  try {
    const token = tokenHeader.split(" ")[1];
    const decodedToken = await admin.auth().verifyIdToken(token);
    return decodedToken.uid;
  } catch (err) {
    throw new Error("Unable to identify the user.");
  }
};
