import {
  AppBar as MuiAppBar,
  Toolbar,
  Typography,
  useTheme,
  useMediaQuery,
  Avatar,
} from "@mui/material";
import makeStyles from "@mui/styles/makeStyles";
import { useAuth } from "../../auth";
import { AppBarButtons } from "./buttons/AppBarButtons";
import { NavigationMenuButton } from "./buttons/NavigationMenuButton";

const useStyles = makeStyles((theme) => ({
  title: {
    fontWeight: 400,
    whiteSpace: "nowrap",
    [theme.breakpoints.down("md")]: {
      color: theme.palette.common.white,
    },
  },
  titleSpacing: {
    marginLeft: "17rem",
    padding: "2rem",
    position: "relative",
  },
  titleContainer: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
    padding: "2rem",
    [theme.breakpoints.down("md")]: {
      padding: 0,
    },
  },
  toolbar: {
    minHeight: 64,
    display: "flex",
    justifyContent: "space-between",
    padding: "0 8px",
  },
  appBar: {
    padding: "4px 0",
    maxHeight: 72,
    marginLeft: 0,
  },

  logo: {
    width: "17rem",
    height: "17rem",
    marginRight: "2rem",
  },
}));

export const AppBar = () => {
  const { isSignedIn } = useAuth();
  const styles = useStyles();
  const theme = useTheme();
  const matches = useMediaQuery(theme.breakpoints.down("md"));
  const headerVariant = matches ? "h3" : "h1";
  const title = (
    <Typography variant={headerVariant} align="center" className={styles.title}>
      Activity tracker
    </Typography>
  );
  const wideScreenTitle = isSignedIn ? (
    <div className={styles.titleSpacing}>
      {title}
      <AppBarButtons />
    </div>
  ) : (
    <div className={styles.titleContainer}>
      <Avatar
        src="/android-chrome-192x192.png"
        className={styles.logo}
        alt="App logo"
      />
      <div>{title}</div>
      <AppBarButtons />
    </div>
  );
  const narrowScreenTitle = (
    <MuiAppBar position="sticky" className={styles.appBar}>
      <Toolbar className={styles.toolbar}>
        <NavigationMenuButton />
        <div className={styles.titleContainer}>{title}</div>
        <AppBarButtons />
      </Toolbar>
    </MuiAppBar>
  );
  return matches ? <>{narrowScreenTitle}</> : <>{wideScreenTitle}</>;
};
