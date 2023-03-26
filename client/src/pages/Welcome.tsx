import { styled, Typography } from "@mui/material";
import { format } from "date-fns";
import { useAuth } from "../auth";
import { AddActivityForm, ModalDialog } from "../components";
import { useActivitiesWithLimit } from "../data";
import { sortDescendingByDate } from "../data";

const Container = styled("div")({
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
});

const LastActivity = styled("span")({
  fontWeight: 500,
});

const Spacing = styled("div")({
  padding: "2rem 0",
});

export const Welcome = () => {
  const { user } = useAuth();
  const { data } = useActivitiesWithLimit();
  const lastActivity = data ? sortDescendingByDate(data)[0] : undefined;

  return (
    <Container>
      <Typography variant="h5">Welcome {user?.displayName}</Typography>
      <Spacing>
        <ModalDialog
          openButtonText="Quick add"
          title="Fill activity data"
          content={<AddActivityForm />}
        />
      </Spacing>
      {lastActivity && (
        <div>
          Last added:{" "}
          <LastActivity>
            {lastActivity.name} on {format(lastActivity.date, "yyyy-MM-dd")}
          </LastActivity>
        </div>
      )}
    </Container>
  );
};
