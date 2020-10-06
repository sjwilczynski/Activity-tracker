import * as React from "react";
import DownloadLink from "react-download-link";
import { useAuth } from "../auth";
import { ErrorView, FileUploadForm } from "../components";
import { useDeleteAllActivities, useExportedActivities } from "../data";

export const Profile = () => {
  const { user } = useAuth();
  const exportedActivities = useExportedActivities();
  const exportFile = () => JSON.stringify(exportedActivities);

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
      {exportedActivities && (
        <div>
          <DownloadLink
            filename="activities.json"
            tagName="button"
            label="Export activities"
            exportFile={exportFile}
          />
        </div>
      )}
    </>
  );
};
