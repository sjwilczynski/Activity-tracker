import * as React from "react";
import { useAuth } from "../auth";
import { ErrorView, FileUploadForm } from "../components";
import { useDeleteAllActivities } from "../data";

export const Profile = () => {
  const { user } = useAuth();
  const [deleteAllActivities, { error, status }] = useDeleteAllActivities();
  if (error) {
    return <ErrorView error={error} />;
  }
  return (
    <>
      <div>User name: {user?.displayName}</div>
      {/* TODO: wrap this button in dialog to have confirmation */}
      <button onClick={deleteAllActivities}>Delete all your activities</button>
      {/* TODO: remove check for status here - create a component encapsulting message on different statuses */}
      {status === "success" ? (
        <div>Successfully deleted the data</div>
      ) : undefined}
      <div>
        <FileUploadForm />
      </div>
    </>
  );
};
