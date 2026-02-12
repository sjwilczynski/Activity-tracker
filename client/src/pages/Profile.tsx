import { Button, styled, Typography } from "@mui/material";
import { useFetcher } from "react-router";
import { useAuthContext } from "../auth";
import { DownloadLink } from "../components/DownloadLink";
import { FileUploadForm } from "../components/forms/FileUploadForm";
import { ModalDialog } from "../components/ModalDialog";
import {
  useActivities,
  useExportActivities,
  useIsFetchingActivties,
} from "../data";
import { useFeedbackToast } from "../hooks/useFeedbackToast";

const Container = styled("div")({
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  gap: "2rem",
});

const ButtonsContainer = styled("div")({
  display: "flex",
  flexDirection: "column",
  gap: "0.5rem",
});

const ButtonGrow = styled(Button)({
  flex: "1 1 auto",
});

export const Profile = () => {
  const { user, signOut } = useAuthContext();
  const exportActivities = useExportActivities();
  const { data } = useActivities();
  const isFetchingActivities = useIsFetchingActivties();

  const fetcher = useFetcher<{ ok?: boolean; error?: string }>();
  const isSuccess = fetcher.state === "idle" && fetcher.data?.ok === true;
  const isError = fetcher.state === "idle" && fetcher.data?.error !== undefined;

  useFeedbackToast(
    { isSuccess, isError },
    {
      successMessage: "Successfully deleted all activity data",
      errorMessage: "Failed to delete the activity data",
    }
  );

  const deleteAllActivities = () => {
    fetcher.submit(
      { intent: "delete-all" },
      { method: "post", action: "/profile" }
    );
  };

  return (
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
  );
};
