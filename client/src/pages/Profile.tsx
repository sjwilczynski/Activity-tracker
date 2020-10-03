import * as React from "react";
import { useAuth } from "../auth/useAuth";
import { AddActivityForm } from "../components/forms/AddActivityForm";

export const Profile = () => {
  const { user } = useAuth();
  return (
    <>
      <div>User name: {user?.displayName}</div>
      <AddActivityForm />
    </>
  );
};
