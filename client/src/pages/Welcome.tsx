import * as React from "react";
import { useAuth } from "../auth";

export const Welcome = () => {
  const { user } = useAuth();
  return <div>Welcome {user?.displayName}</div>;
};
