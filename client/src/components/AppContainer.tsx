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
    appBar: {
      maxHeight: "64px",
      display: "none",
      [theme.breakpoints.down("sm")]: {
        display: "flex",
      },
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
            <div>
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
