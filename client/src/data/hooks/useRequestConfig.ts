import { useAuthContext } from "../../auth/AuthContext";

export const useRequestConfig = () => {
  const { getIdToken } = useAuthContext();
  if (!getIdToken) {
    return () => {
      throw new Error("No function to fetch the auth token");
    };
  } else {
    return async () => {
      const idToken = await getIdToken();
      return { headers: { "x-auth-token": idToken } };
    };
  }
};
