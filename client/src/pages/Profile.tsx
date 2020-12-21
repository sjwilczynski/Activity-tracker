import { Button, makeStyles, Typography } from "@material-ui/core";
import { useEffect, useState } from "react";
import DownloadLink from "react-download-link";
import { useAuth } from "../auth";
import { FeedbackAlert, FileUploadForm, ModalDialog } from "../components";
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
}));

export const Profile = () => {
  const { user, signOut } = useAuth();
  const exportActivities = useExportActivities();
  const isFetchingActivities = useIsFetchingActivties();
  const styles = useStyles();
  const [isError, setIsError] = useState<boolean>(false);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);

  const {
    mutate: deleteAllActivities,
    isSuccess: isSuccessDelete,
    isError: isErrorDelete,
  } = useDeleteAllActivities();

  useEffect(() => {
    if (isErrorDelete) {
      setIsError(true);
    }
  }, [isErrorDelete]);
  useEffect(() => {
    if (isSuccessDelete) {
      setIsSuccess(true);
    }
  }, [isSuccessDelete]);
  return (
    <>
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
        <div className={styles.spacing}>
          <DownloadLink
            filename="activities.json"
            tagName="div"
            style={{}}
            label={
              <Button
                variant="contained"
                color="primary"
                disabled={isFetchingActivities}
              >
                Export activities
              </Button>
            }
            exportFile={exportActivities}
          />
        </div>
        <div className={styles.spacing}>
          <Button variant="contained" color="primary" onClick={signOut}>
            Sign out
          </Button>
        </div>
      </div>
      <FeedbackAlert
        open={isSuccess}
        setOpen={setIsSuccess}
        severity="success"
        message="Successfully deleted data"
      />
      <FeedbackAlert
        open={isError}
        setOpen={setIsError}
        severity="error"
        message="Failed to delete data"
      />
    </>
  );
};
