import {
  AppBar as MuiAppBar,
  makeStyles,
  Toolbar,
  Typography,
  useTheme,
  useMediaQuery,
  Avatar,
} from "@material-ui/core";
import { useAuth } from "../../auth";
import { AppBarButtons } from "./buttons/AppBarButtons";
import { NavigationMenuButton } from "./buttons/NavigationMenuButton";

const useStyles = makeStyles((theme) => {
  return {
    title: {
      fontWeight: 400,
      whiteSpace: "nowrap",
      [theme.breakpoints.down("sm")]: {
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
      [theme.breakpoints.down("sm")]: {
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
  };
});

type Props = {
  handleNavigationToggle: () => void;
};

export const AppBar = ({ handleNavigationToggle }: Props) => {
  const { isSignedIn } = useAuth();
  const styles = useStyles();
  const theme = useTheme();
  const matches = useMediaQuery(theme.breakpoints.down("sm"));
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
        <NavigationMenuButton handleNavigationToggle={handleNavigationToggle} />
        <div className={styles.titleContainer}>{title}</div>
        <AppBarButtons />
      </Toolbar>
    </MuiAppBar>
  );
  return matches ? <>{narrowScreenTitle}</> : <>{wideScreenTitle}</>;
};
