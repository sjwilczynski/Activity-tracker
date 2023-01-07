import { styled } from "@mui/material";
import { Pages } from "../../pages";
import { Navigation } from "../navigation/Navigation";
import { AppBar } from "./AppBar";

const Container = styled("div")(({ theme }) => ({
  height: "100%",
  display: "grid",
  gridTemplateColumns: "minmax(200px, 17rem) 1fr",
  gridTemplateRows: "auto 1fr",
  gridTemplateAreas: `"navigation header" 
                      "navigation content"`,
  [theme.breakpoints.down("md")]: {
    gridTemplateColumns: "1fr",
    gridTemplateRows: "72px 1fr",
    gridTemplateAreas: `"header" 
                        "content"`,
  },
}));

export const AppContainer = () => (
  <>
    <Container>
      <Navigation />
      <AppBar />
      <Pages />
    </Container>
  </>
);
