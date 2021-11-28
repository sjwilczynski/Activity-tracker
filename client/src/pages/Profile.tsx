import { Button, styled, Typography } from "@mui/material";
import DownloadLink from "react-download-link";
import { useAuth } from "../auth";
import { FeedbackAlertGroup, FileUploadForm, ModalDialog } from "../components";
import {
  useActivities,
  useDeleteAllActivities,
  useExportActivities,
  useIsFetchingActivties,
} from "../data";

const Container = styled("div")({
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  marginTop: "12rem",
});

const ButtonsContainer = styled("div")({
  display: "flex",
  flexDirection: "column",

  "& > *": {
    margin: "0.5rem 0",
  },
});

const ButtonGrow = styled(Button)({
  flex: "1 1 auto",
});

export const Profile = () => {
  const { user, signOut } = useAuth();
  const exportActivities = useExportActivities();
  const { data } = useActivities();
  const isFetchingActivities = useIsFetchingActivties();

  const {
    mutate: deleteAllActivities,
    isSuccess,
    isError,
  } = useDeleteAllActivities();

  return (
    <>
      <Container>
        <Typography variant="h5">User name: {user?.displayName}</Typography>
        <ButtonsContainer>
          <ModalDialog
            openButtonText="Upload activities"
            title="Activties upload"
            description="Select a json file containg activities in a complaint format"
            content={<FileUploadForm />}
          />
          <ModalDialog
            openButtonText="Delete your activites"
            title="Delete confirmation"
            description="Are you sure you want to delete all your activities?"
            disabled={isFetchingActivities || !data?.length}
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
          <DownloadLink
            filename="activities.json"
            tagName="div"
            style={{ display: "flex" }}
            label={
              <ButtonGrow
                variant="contained"
                color="primary"
                disabled={isFetchingActivities || !data?.length}
              >
                Export activities
              </ButtonGrow>
            }
            exportFile={exportActivities}
          />
          <Button variant="contained" color="primary" onClick={signOut}>
            Sign out
          </Button>
        </ButtonsContainer>
      </Container>
      <FeedbackAlertGroup
        isRequestError={isError}
        isRequestSuccess={isSuccess}
        successMessage="Successfully deleted all activity data"
        errorMessage="Failed to delete the activity data"
      />
    </>
  );
};
