import { useAuthContext } from "./AuthContext";

export const useAuth = () => {
  const auth = useAuthContext();
  return { ...auth, isSignedIn: !!auth.user };
};
