import { makeStyles, Typography } from "@material-ui/core";
import { format } from "date-fns";
import { useEffect, useState } from "react";
import { useAuth } from "../auth";
import { AddActivityForm, ModalDialog } from "../components";
import { ActivityRecord, sortDescendingByDate, useActivities } from "../data";

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
    padding: "2rem 0",
  },
}));

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
  const styles = useStyles();

  return (
    <div className={styles.container}>
      <Typography variant="h5">Welcome {user?.displayName}</Typography>
      <div className={styles.spacing}>
        <ModalDialog
          openButtonText="Quick add"
          title="Fill activity data"
          content={<AddActivityForm />}
        />
      </div>
      {lastActivity && (
        <div>
          Last added:{" "}
          <span className={styles.lastActivity}>
            {lastActivity.name} on {format(lastActivity.date, "yyyy-MM-dd")}
          </span>
        </div>
      )}
    </div>
  );
};
