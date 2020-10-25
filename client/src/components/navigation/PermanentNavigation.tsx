import { createStyles, Drawer, makeStyles, Theme } from "@material-ui/core";
import * as React from "react";

type Props = {
  children: React.ReactNode;
};

const useStyles = makeStyles((theme: Theme) => {
  const drawerWidth = "20%";
  return createStyles({
    navigation: {
      width: drawerWidth,
      height: "100vh",
    },
    drawerPaper: {
      width: drawerWidth,
      height: "100vh",
      background: theme.palette.primary.main,
      border: "none",
      display: "flex",
      justifyContent: "center",
    },
    drawer: {},
  });
});

export const PermanentNavigation = ({ children }: Props) => {
  const styles = useStyles();
  return (
    <nav className={styles.navigation}>
      <Drawer
        className={styles.drawer}
        variant="permanent"
        open
        classes={{ paper: styles.drawerPaper }}
      >
        {children}
      </Drawer>
    </nav>
  );
};
