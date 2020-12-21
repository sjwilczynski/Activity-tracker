import { Button, makeStyles, Typography } from "@material-ui/core";
import DownloadLink from "react-download-link";
import { useAuth } from "../auth";
import { FeedbackAlertGroup, FileUploadForm, ModalDialog } from "../components";
import {
  useDeleteAllActivities,
  useExportActivities,
  useIsFetchingActivties,
} from "../data";

const useStyles = makeStyles(() => ({
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
  buttonsContainer: {
    display: "flex",
    flexDirection: "column",
    "& > *": {
      margin: "0.5rem 0",
    },
  },
  buttonGrow: {
    flex: "1 1 auto",
  },
}));

export const Profile = () => {
  const { user, signOut } = useAuth();
  const exportActivities = useExportActivities();
  const isFetchingActivities = useIsFetchingActivties();
  const styles = useStyles();

  const {
    mutate: deleteAllActivities,
    isSuccess,
    isError,
  } = useDeleteAllActivities();

  return (
    <>
      <div className={styles.container}>
        <Typography variant="h5">User name: {user?.displayName}</Typography>
        <div className={styles.buttonsContainer}>
          <ModalDialog
            openButtonText="Delete your activites"
            title="Delete confirmation"
            description="Are you sure you want to delete all your activities?"
            content={
              <Button
                variant="contained"
                color="primary"
                onClick={deleteAllActivities}
              >
                Confirm
              </Button>
            }
          />

          <ModalDialog
            openButtonText="Upload activities"
            title="Activties upload"
            description="Select a json file containg activities in a complaint format"
            content={<FileUploadForm />}
          />
          <DownloadLink
            filename="activities.json"
            tagName="div"
            style={{ display: "flex" }}
            label={
              <Button
                variant="contained"
                color="primary"
                disabled={isFetchingActivities}
                className={styles.buttonGrow}
              >
                Export activities
              </Button>
            }
            exportFile={exportActivities}
          />
          <Button variant="contained" color="primary" onClick={signOut}>
            Sign out
          </Button>
        </div>
      </div>
      <FeedbackAlertGroup
        isRequestError={isError}
        isRequestSuccess={isSuccess}
        successMessage="Successfully deleted all activity data"
        errorMessage="Failed to delete the activity data"
      />
    </>
  );
};
