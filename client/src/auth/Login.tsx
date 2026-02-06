import GoogleIcon from "@mui/icons-material/Google";
import {
  Alert,
  Box,
  Button,
  Divider,
  Link,
  TextField,
  styled,
} from "@mui/material";
import {
  GoogleAuthProvider,
  createUserWithEmailAndPassword,
  getAuth,
  signInWithEmailAndPassword,
  signInWithPopup,
} from "firebase/auth";
import { useState } from "react";

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

const FormBox = styled(Box)({
  display: "flex",
  flexDirection: "column",
  gap: "1rem",
  width: "100%",
  maxWidth: 320,
  marginTop: "2rem",
});

export const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSignUp, setIsSignUp] = useState(false);

  const auth = getAuth();

  const handleGoogleSignIn = async () => {
    setError(null);
    try {
      await signInWithPopup(auth, new GoogleAuthProvider());
    } catch (e) {
      setError((e as Error).message);
    }
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      if (isSignUp) {
        await createUserWithEmailAndPassword(auth, email, password);
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
    } catch (err) {
      setError((err as Error).message);
    }
  };

  return (
    <Container>
      <Text>
        <SpanActive>Team active</SpanActive>
        <SpanOr>or</SpanOr>
        <SpanLazy>Team lazy</SpanLazy>
      </Text>
      <FormBox>
        <Button
          variant="outlined"
          startIcon={<GoogleIcon />}
          onClick={handleGoogleSignIn}
          fullWidth
        >
          Sign in with Google
        </Button>
        <Divider>or</Divider>
        <form onSubmit={handleEmailSubmit}>
          <Box display="flex" flexDirection="column" gap="1rem">
            <TextField
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              fullWidth
              size="small"
            />
            <TextField
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              fullWidth
              size="small"
            />
            <Button type="submit" variant="contained" fullWidth>
              {isSignUp ? "Sign up" : "Sign in"} with email
            </Button>
          </Box>
        </form>
        <Link
          component="button"
          variant="body2"
          onClick={() => {
            setIsSignUp((prev) => !prev);
            setError(null);
          }}
        >
          {isSignUp
            ? "Already have an account? Sign in"
            : "New user? Create account"}
        </Link>
        {error && <Alert severity="error">{error}</Alert>}
      </FormBox>
    </Container>
  );
};
