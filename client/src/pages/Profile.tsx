import { Button, makeStyles, Typography } from "@material-ui/core";
import DownloadLink from "react-download-link";
import { useAuth } from "../auth";
import { ErrorView, FileUploadForm, ModalDialog } from "../components";
import {
  useDeleteAllActivities,
  useExportActivities,
  useIsFetchingActivties,
} from "../data";

const useStyles = makeStyles(() => {
  return {
    container: {
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      marginTop: "12rem",
    },
    lastActivity: {
      fontWeight: 500,
    },
    spacing: {
      padding: "0.5rem",
    },
  };
});

export const Profile = () => {
  const { user, signOut } = useAuth();
  const exportActivities = useExportActivities();
  const isFetchingActivities = useIsFetchingActivties();
  const styles = useStyles();

  const {
    mutate: deleteAllActivities,
    error,
    status,
  } = useDeleteAllActivities();
  if (error) {
    return <ErrorView error={error} />;
  }
  return (
    <div className={styles.container}>
      <Typography variant="h5">User name: {user?.displayName}</Typography>
      <div className={styles.spacing}>
        <ModalDialog
          openButtonText="Delete your activites"
          title="Delete confirmation"
          description="Are you sure you want to delete all your activities?"
          content={
            <>
              <Button
                variant="contained"
                color="primary"
                onClick={deleteAllActivities}
              >
                Confirm
              </Button>
              {/* TODO: remove check for status here - create a component encapsulting message on different statuses */}
              {status === "success" ? (
                <div>Successfully deleted the data</div>
              ) : undefined}
            </>
          }
        />
      </div>

      <div className={styles.spacing}>
        <ModalDialog
          openButtonText="Upload activities"
          title="Activties upload"
          description="Select a json file containg activities in a complaint format"
          content={<FileUploadForm />}
        />
      </div>
      {!isFetchingActivities && (
        <div className={styles.spacing}>
          <DownloadLink
            filename="activities.json"
            tagName="div"
            style={{}}
            label={
              <Button variant="contained" color="primary">
                Export activities
              </Button>
            }
            exportFile={exportActivities}
          />
        </div>
      )}
      <div className={styles.spacing}>
        <Button variant="contained" color="primary" onClick={signOut}>
          Sign out
        </Button>
      </div>
    </div>
  );
};
