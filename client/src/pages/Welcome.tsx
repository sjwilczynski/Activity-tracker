import * as React from "react";
import { useAuth } from "../auth";
import { AddActivityForm, ModalDialog } from "../components";

export const Welcome = () => {
  const { user } = useAuth();
  return (
    <>
      <div>Welcome {user?.displayName}</div>
      <ModalDialog
        openButtonText="Quick add"
        title="Fill activity data"
        content={<AddActivityForm />}
      />
    </>
  );
};
