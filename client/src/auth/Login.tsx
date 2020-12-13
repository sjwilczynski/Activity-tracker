import { FirebaseAuth } from "react-firebaseui";
import firebase from "firebase/app";
import "firebase/auth";
import { makeStyles } from "@material-ui/core";

const uiConfig: firebaseui.auth.Config = {
  // Popup signin flow rather than redirect flow.
  signInFlow: "popup",
  signInOptions: [
    firebase.auth.GoogleAuthProvider.PROVIDER_ID,
    firebase.auth.EmailAuthProvider.PROVIDER_ID,
  ],
  callbacks: {
    // Avoid redirects after sign-in.
    signInSuccessWithAuthResult: () => false,
  },
};

const useStyles = makeStyles((theme) => {
  return {
    container: {
      display: "flex",
      alignItems: "center",
      flexDirection: "column",
      padding: "2rem",
    },
    text: {
      ...theme.typography.h3,
      display: "flex",
      [theme.breakpoints.down("sm")]: {
        flexFlow: "column wrap",
        alignItems: "center",
      },
    },
    active: { color: theme.palette.primary.main },
    lazy: { color: theme.palette.error.main },
    or: {
      margin: "0 1rem",
    },
  };
});

export const Login = () => {
  const styles = useStyles();
  return (
    <div className={styles.container}>
      <div className={styles.text}>
        <span className={styles.active}>Team active</span>
        <span className={styles.or}>or</span>
        <span className={styles.lazy}>Team lazy</span>
      </div>
      <FirebaseAuth uiConfig={uiConfig} firebaseAuth={firebase.auth()} />
    </div>
  );
};
