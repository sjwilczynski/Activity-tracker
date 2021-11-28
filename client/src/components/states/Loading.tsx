import { CircularProgress } from "@mui/material";
import makeStyles from "@mui/styles/makeStyles";

const useStyles = makeStyles({
  spinnerContainer: {
    margin: "12rem auto",
  },
});

export const Loading = () => {
  const styles = useStyles();
  return (
    <div className={styles.spinnerContainer}>
      <CircularProgress color="primary" size="5rem" thickness={2} />
    </div>
  );
};
