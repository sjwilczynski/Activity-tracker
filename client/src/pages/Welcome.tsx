import * as React from "react";
import { useAuth } from "../auth";
import { AddActivityForm } from "../components";

export const Welcome = () => {
  const { user } = useAuth();
  return (
    <>
      <div>Welcome {user?.displayName}</div>
      <AddActivityForm />
    </>
  );
};
