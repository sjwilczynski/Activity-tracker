import { useAuthContext } from "../../auth";

export type HeadersPromise = Promise<Record<string, string>>;

export const useRequestConfig = (): (() => HeadersPromise) => {
  const { getIdToken } = useAuthContext();
  if (!getIdToken) {
    return () => {
      throw new Error("No function to fetch the auth token");
    };
  } else {
    return async () => {
      const idToken = await getIdToken();
      return { "x-auth-token": idToken };
    };
  }
};
