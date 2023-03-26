import firebase from "firebase/compat/app";
import "firebase/compat/auth";
import { styled } from "@mui/material";
import FirebaseAuth from "./FirebaseAuth";

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

const Container = styled("div")({
  display: "flex",
  alignItems: "center",
  flexDirection: "column",
  padding: "2rem",
});

const Text = styled("div")(({ theme }) => ({
  ...theme.typography.h3,
  display: "flex",

  [theme.breakpoints.down("md")]: {
    flexFlow: "column wrap",
    alignItems: "center",
  },
}));

const SpanActive = styled("span")(({ theme }) => ({
  color: theme.palette.info.main,
}));

const SpanLazy = styled("span")(({ theme }) => ({
  color: theme.palette.error.main,
}));

const SpanOr = styled("span")({
  margin: "0 1rem",
});

export const Login = () => {
  return (
    <Container>
      <Text>
        <SpanActive>Team active</SpanActive>
        <SpanOr>or</SpanOr>
        <SpanLazy>Team lazy</SpanLazy>
      </Text>
      <FirebaseAuth uiConfig={uiConfig} firebaseAuth={firebase.auth()} />
    </Container>
  );
};
