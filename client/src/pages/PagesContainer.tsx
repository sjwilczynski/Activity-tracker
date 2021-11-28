import { styled } from "@mui/material";

type Props = {
  children: React.ReactNode;
};

const Container = styled("div")(({ theme }) => ({
  overflow: "auto",
  padding: "2rem",
  flexDirection: "column",
  display: "flex",
  marginLeft: "17rem",
  [theme.breakpoints.down("md")]: {
    marginLeft: "0",
  },
}));

export const PagesContainer = ({ children }: Props) => (
  <Container>{children}</Container>
);
