import {
  AppBar as MuiAppBar,
  IconButton,
  makeStyles,
  Toolbar,
  Typography,
  useTheme,
  useMediaQuery,
} from "@material-ui/core";
import MenuIcon from "@material-ui/icons/Menu";

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
    },
    appBar: {
      maxHeight: "64px",
      marginLeft: "0",
      width: "100%",
    },
    inlineTitle: {
      marginLeft: "17rem",
      padding: "2rem",
      fontWeight: 400,
    },
  };
});

type Props = {
  handleNavigationToggle: () => void;
};

export const AppBar = ({ handleNavigationToggle }: Props) => {
  const styles = useStyles();
  const theme = useTheme();
  const matches = useMediaQuery(theme.breakpoints.down("sm"));
  const headerVariant = matches ? "h3" : "h1";
  const title = (
    <div className={styles.titleContainer}>
      <Typography
        variant={headerVariant}
        align="center"
        className={styles.title}
      >
        Activity tracker
      </Typography>
    </div>
  );
  return (
    <>
      {matches ? (
        <MuiAppBar position="sticky" className={styles.appBar}>
          <Toolbar>
            <div>
              <IconButton color="inherit" onClick={handleNavigationToggle}>
                <MenuIcon />
              </IconButton>
            </div>
            {title}
          </Toolbar>
        </MuiAppBar>
      ) : (
        <div className={styles.inlineTitle}>{title}</div>
      )}
    </>
  );
};
