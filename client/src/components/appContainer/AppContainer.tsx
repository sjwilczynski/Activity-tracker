import { styled } from "@mui/material";
import { Navigation } from "../navigation/Navigation";
import { AppBar } from "./AppBar";

type Props = {
  children: React.ReactNode;
};

const Container = styled("div")({
  display: "flex",
  flexDirection: "column",
  minWidth: 420,
});

export const AppContainer = ({ children }: Props) => {
  return (
    <>
      <Container>
        <AppBar />
        {children}
      </Container>
      <Navigation />
    </>
  );
};
