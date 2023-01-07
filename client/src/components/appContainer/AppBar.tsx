import {
  AppBar as MuiAppBar,
  Toolbar,
  Typography,
  useTheme,
  useMediaQuery,
  Avatar,
  styled,
} from "@mui/material";
import { useAuth } from "../../auth";
import { AppBarButtons } from "./buttons/AppBarButtons";
import { NavigationMenuButton } from "./buttons/NavigationMenuButton";

const TypographyTitle = styled(Typography)(({ theme }) => ({
  fontWeight: 400,
  whiteSpace: "nowrap",

  [theme.breakpoints.down("md")]: {
    color: theme.palette.common.white,
  },
}));

const TitleSpacing = styled("div")({
  padding: "2rem",
  position: "relative",
});

const TitleContainer = styled("div")(({ theme }) => ({
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  position: "relative",
  padding: "2rem",

  [theme.breakpoints.down("md")]: {
    padding: 0,
  },
}));

const StyledToolbar = styled(Toolbar)({
  display: "flex",
  justifyContent: "space-between",
  padding: "0 8px",
});

const StyledMuiAppBar = styled(MuiAppBar)({
  padding: "4px 0",
  justifyContent: "center",
  marginLeft: 0,
  gridArea: "header",
});

const AvatarLogo = styled(Avatar)({
  width: "17rem",
  height: "17rem",
  marginRight: "2rem",
});

export const AppBar = () => {
  const { isSignedIn } = useAuth();
  const theme = useTheme();
  const matches = useMediaQuery(theme.breakpoints.down("md"));
  const headerVariant = matches ? "h3" : "h1";
  const title = (
    <TypographyTitle variant={headerVariant} align="center">
      Activity tracker
    </TypographyTitle>
  );
  const wideScreenTitle = isSignedIn ? (
    <TitleSpacing>
      {title}
      <AppBarButtons />
    </TitleSpacing>
  ) : (
    <TitleContainer>
      <AvatarLogo src="/android-chrome-192x192.png" alt="App logo" />
      <div>{title}</div>
      <AppBarButtons />
    </TitleContainer>
  );
  const narrowScreenTitle = (
    <StyledMuiAppBar position="sticky">
      <StyledToolbar>
        <NavigationMenuButton />
        <TitleContainer>{title}</TitleContainer>
        <AppBarButtons />
      </StyledToolbar>
    </StyledMuiAppBar>
  );
  return matches ? <>{narrowScreenTitle}</> : <>{wideScreenTitle}</>;
};
