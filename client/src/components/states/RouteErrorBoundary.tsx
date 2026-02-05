import { Button, Typography, styled } from "@mui/material";
import { Link, isRouteErrorResponse, useRouteError } from "react-router";

const Container = styled("div")({
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  height: "50vh",
  gap: "1rem",
  textAlign: "center",
  padding: "2rem",
});

export function RouteErrorBoundary() {
  const error = useRouteError();

  // Unauthorized (401, 403)
  if (
    isRouteErrorResponse(error) &&
    (error.status === 401 || error.status === 403)
  ) {
    return (
      <Container>
        <Typography variant="h4">Session Expired</Typography>
        <Typography>Please sign in again to continue</Typography>
        <Button component={Link} to="/login" variant="contained">
          Sign In
        </Button>
      </Container>
    );
  }

  // Not Found (404)
  if (isRouteErrorResponse(error) && error.status === 404) {
    return (
      <Container>
        <Typography variant="h4">Page Not Found</Typography>
        <Typography>The page you're looking for doesn't exist</Typography>
        <Button component={Link} to="/welcome" variant="contained">
          Go Home
        </Button>
      </Container>
    );
  }

  // General Error (500, network, etc.)
  return (
    <Container>
      <Typography variant="h4">Something Went Wrong</Typography>
      <Typography>We couldn't load this page. Please try again.</Typography>
      <Button variant="contained" onClick={() => window.location.reload()}>
        Try Again
      </Button>
    </Container>
  );
}
