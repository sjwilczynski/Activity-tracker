import { styled, useMediaQuery, useTheme } from "@mui/material";
import { useAuth } from "../../auth";
import { LinkList, NavigationElement } from "./LinkList";
import { NavigationDrawer } from "./NavigationDrawer";

const navList: NavigationElement[] = [
  {
    text: "Start page",
    path: "/welcome",
  },
  {
    text: "Profile",
    path: "/profile",
  },
  {
    text: "Charts",
    path: "/charts",
  },
  {
    text: "Activity list",
    path: "/activity-list",
  },
];

const NavGridArea = styled("nav")({
  gridArea: "navigation",
});

export const Navigation = () => {
  const { isSignedIn } = useAuth();
  const theme = useTheme();
  const matches = useMediaQuery(theme.breakpoints.down("md"));
  return isSignedIn ? (
    <NavGridArea>
      <NavigationDrawer variant={matches ? "temporary" : "permanent"}>
        <LinkList navigationElements={navList} />
      </NavigationDrawer>
    </NavGridArea>
  ) : null;
};
