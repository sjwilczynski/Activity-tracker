import { CircularProgress, makeStyles } from "@material-ui/core";

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
