import {
  AppBar as MuiAppBar,
  IconButton,
  makeStyles,
  Toolbar,
  Typography,
  useTheme,
  useMediaQuery,
  Avatar,
} from "@material-ui/core";
import MenuIcon from "@material-ui/icons/Menu";
import { useAuth } from "../auth";

const useStyles = makeStyles((theme) => {
  return {
    title: {
      fontWeight: 400,
      [theme.breakpoints.down("sm")]: {
        color: theme.palette.common.white,
      },
    },
    titleContainer: {
      display: "flex",
      justifyContent: "center",
      width: "100%",
      minWidth: 415,
      alignItems: "center",
      [theme.breakpoints.up("sm")]: {
        padding: "2rem",
      },
    },
    appBar: {
      maxHeight: "64px",
      marginLeft: "0",
    },
    titleSpacing: {
      marginLeft: "17rem",
      padding: "2rem",
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
    <div className={styles.titleSpacing}>{title}</div>
  ) : (
    <div className={styles.titleContainer}>
      <Avatar
        src="/android-chrome-192x192.png"
        className={styles.logo}
        alt="App logo"
      />
      <div>{title}</div>
    </div>
  );
  const narrowScreenTitle = (
    <MuiAppBar position="sticky" className={styles.appBar}>
      <Toolbar>
        {isSignedIn && (
          <IconButton color="inherit" onClick={handleNavigationToggle}>
            <MenuIcon />
          </IconButton>
        )}
        <div className={styles.titleContainer}>{title}</div>
      </Toolbar>
    </MuiAppBar>
  );
  return matches ? <>{narrowScreenTitle}</> : <>{wideScreenTitle}</>;
};
