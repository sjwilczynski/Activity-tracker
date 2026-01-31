import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import { Button, styled } from "@mui/material";
import { useNavigate } from "react-router-dom";

const ErrorContainer = styled("div")({
  display: "flex",
  flexDirection: "column",
});

const StyledErrorOutlineIcon = styled(ErrorOutlineIcon)({
  marginRight: "0.5rem",
});

const ErrorInfo = styled("div")({
  display: "flex",
  alignItems: "center",
  margin: "1rem 0",
});

const ErrorMessage = styled("span")({
  fontWeight: 500,
  marginLeft: "0.5rem",
});

export const ErrorView = (props: { error: Error }) => {
  const navigate = useNavigate();
  return (
    <ErrorContainer>
      <ErrorInfo>
        <StyledErrorOutlineIcon color="error" fontSize="large" />
        An error has occurred:
        <ErrorMessage>{props.error.message}</ErrorMessage>
      </ErrorInfo>
      <Button
        type="button"
        variant="contained"
        color="primary"
        onClick={() => navigate("/welcome")}
      >
        Back to homepage
      </Button>
    </ErrorContainer>
  );
};
