import * as React from "react";
import { useAuth } from "../auth";
import { AddActivityForm, ModalDialog } from "../components";

export const Welcome = () => {
  const { user } = useAuth();
  return (
    <>
      <div>Welcome {user?.displayName}</div>
      <ModalDialog
        description="Fill activity data"
        openButtonText="Add activity"
        title="Add activity form"
        content={<AddActivityForm />}
      />
    </>
  );
};
