import { Button, makeStyles } from "@material-ui/core";
import ErrorOutlineIcon from "@material-ui/icons/ErrorOutline";
import { useNavigate } from "react-router-dom";

const useStyles = makeStyles({
  errorContainer: {
    margin: "12rem auto",
    display: "flex",
    flexDirection: "column",
  },
  icon: {
    marginRight: "0.5rem",
  },
  errorInfo: {
    display: "flex",
    alignItems: "center",
    margin: "1rem 0",
  },
  errorMessage: {
    fontWeight: 500,
    marginLeft: "0.5rem",
  },
});

export const ErrorView = (props: { error: Error }) => {
  const styles = useStyles();
  const navigate = useNavigate();
  return (
    <div className={styles.errorContainer}>
      <div className={styles.errorInfo}>
        <ErrorOutlineIcon
          color="error"
          fontSize="large"
          className={styles.icon}
        />
        An error has occurred:
        <span className={styles.errorMessage}>{props.error.message}</span>
      </div>
      <Button
        type="button"
        variant="contained"
        color="primary"
        onClick={() => navigate("/welcome")}
      >
        Back to homepage
      </Button>
    </div>
  );
};
