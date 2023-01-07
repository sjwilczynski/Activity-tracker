import { styled } from "@mui/material";

type Props = {
  children: React.ReactNode;
};

const Container = styled("div")({
  padding: "4rem 2rem",
  flexDirection: "column",
  display: "flex",
  gridArea: "content",
});

export const PagesContainer = ({ children }: Props) => (
  <Container>{children}</Container>
);
