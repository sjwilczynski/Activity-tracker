import React from "react";
import { useAuth } from "../auth/useAuth";

export const Welcome = () => {
  const { user } = useAuth();
  return <div>Welcome {user?.displayName}</div>;
};
