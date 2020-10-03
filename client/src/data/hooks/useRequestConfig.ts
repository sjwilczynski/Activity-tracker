import { useAuthContext } from "../../auth";

export type ConfigPromise = Promise<{
  headers: {
    "x-auth-token": string;
  };
}>;

export const useRequestConfig = (): (() => ConfigPromise) => {
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
