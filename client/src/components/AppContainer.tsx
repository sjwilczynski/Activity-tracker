import {
  AppBar,
  IconButton,
  makeStyles,
  Toolbar,
  Typography,
} from "@material-ui/core";
import MenuIcon from "@material-ui/icons/Menu";
import * as React from "react";
import { Navigation } from "./navigation/Navigation";
import { useNavigationState } from "./navigation/useNavigationState";

type Props = {
  children: React.ReactNode;
};

const useStyles = makeStyles((theme) => {
  return {
    container: {
      display: "flex",
      flexDirection: "column",
    },
    title: {
      color: theme.palette.common.white,
    },
    titleContainer: {
      display: "flex",
      justifyContent: "center",
      width: "100%",
    },
    iconContainer: {
      width: "20%",
      [theme.breakpoints.down("sm")]: {
        width: "0%",
      },
    },
    appBar: {
      maxHeight: "64px",
    },
  };
});

export const AppContainer = ({ children }: Props) => {
  const styles = useStyles();
  const { isNavigationOpen, handleNavigationToggle } = useNavigationState();
  return (
    <>
      <div className={styles.container}>
        <AppBar position="sticky" className={styles.appBar}>
          <Toolbar>
            <div className={styles.iconContainer}>
              <IconButton color="inherit" onClick={handleNavigationToggle}>
                <MenuIcon />
              </IconButton>
            </div>
            <div className={styles.titleContainer}>
              <Typography variant="h3" align="center" className={styles.title}>
                Activity tracker
              </Typography>
            </div>
          </Toolbar>
        </AppBar>
        {children}
      </div>
      <Navigation
        isNavigationOpen={isNavigationOpen}
        handleNavigationToggle={handleNavigationToggle}
      />
    </>
  );
};
