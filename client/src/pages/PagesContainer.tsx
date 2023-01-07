import { styled } from "@mui/material";

type Props = {
  children: React.ReactNode;
};

const Container = styled("div")(({ theme }) => ({
  padding: "4rem 2rem",
  flexDirection: "column",
  display: "flex",
  gridArea: "content",

  [theme.breakpoints.down("md")]: {
    justifyContent: "center",
  },
}));

export const PagesContainer = ({ children }: Props) => (
  <Container>{children}</Container>
);
