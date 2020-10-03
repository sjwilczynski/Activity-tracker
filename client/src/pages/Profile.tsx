import * as React from "react";
import { useAuth } from "../auth";
import { AddActivityForm } from "../components";

export const Profile = () => {
  const { user } = useAuth();
  return (
    <>
      <div>User name: {user?.displayName}</div>
      <AddActivityForm />
    </>
  );
};
