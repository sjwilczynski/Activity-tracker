import { styled, Typography } from "@mui/material";
import { format } from "date-fns";
import { useEffect, useState } from "react";
import { useAuth } from "../auth";
import { AddActivityForm, ModalDialog } from "../components";
import { ActivityRecord, sortDescendingByDate, useActivities } from "../data";

const Container = styled("div")({
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  marginTop: "12rem",
});

const LastActivity = styled("span")({
  fontWeight: 500,
});

const Spacing = styled("div")({
  padding: "2rem 0",
});

export const Welcome = () => {
  const { user } = useAuth();
  const { data } = useActivities();
  const [lastActivity, setLastActivity] = useState<ActivityRecord | undefined>(
    undefined
  );
  useEffect(() => {
    if (data) {
      setLastActivity(sortDescendingByDate(data)[0]);
    }
  }, [data]);

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
