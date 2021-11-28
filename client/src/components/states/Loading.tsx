import { CircularProgress, styled } from "@mui/material";

const SpinnerContainer = styled("div")({
  margin: "12rem auto",
});

export const Loading = () => {
  return (
    <SpinnerContainer>
      <CircularProgress color="primary" size="5rem" thickness={2} />
    </SpinnerContainer>
  );
};
