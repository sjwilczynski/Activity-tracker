import { auth } from "../firebase/firebase";

export const getUserId = async (
  token: string | null | undefined
): Promise<string> => {
  if (token === undefined || token === null) {
    throw new Error("Received no id token");
  }
  try {
    const decodedToken = await auth.verifyIdToken(token);
    return decodedToken.uid;
  } catch {
    throw new Error(`Unable to identify the user using token: ${token}`);
  }
};
