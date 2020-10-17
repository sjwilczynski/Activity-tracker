import React from "react";
import Drawer from "@material-ui/core/Drawer";
import { makeStyles, createStyles } from "@material-ui/core/styles";

const useStyles = makeStyles(() => {
  const drawerWidth = "20%";
  return createStyles({
    drawer: {
      width: drawerWidth,
    },
    drawerPaper: {
      width: drawerWidth,
    },
  });
});

type Props = {
  children: React.ReactNode;
};

export const PermanentDrawer = ({ children }: Props) => {
  const styles = useStyles();

  return (
    <>
      <Drawer
        variant="permanent"
        open
        className={styles.drawer}
        classes={{ paper: styles.drawerPaper }}
      >
        {children}
      </Drawer>
    </>
  );
};
