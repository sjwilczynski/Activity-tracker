import React from "react";
import {
  Drawer,
  makeStyles,
  createStyles,
  Theme,
  useTheme,
  useMediaQuery,
} from "@material-ui/core";

const useStyles = makeStyles((theme: Theme) => {
  const drawerWidth = "20%";
  return createStyles({
    drawer: {
      width: drawerWidth,
      height: "100vh",
    },
    drawerPaper: {
      width: drawerWidth,
      height: "100vh",
    },
    permanentDrawer: {},
    temporaryDrawer: {},
    toolbar: theme.mixins.toolbar,
  });
});

type Props = {
  children: React.ReactNode;
  isNavigationOpen: boolean;
  handleNavigationToggle: () => void;
};

export const NavigationContainer = ({
  isNavigationOpen,
  handleNavigationToggle,
  children,
}: Props) => {
  const theme = useTheme();
  const styles = useStyles(theme);
  const matches = useMediaQuery(theme.breakpoints.down("sm"));
  const drawer = matches ? (
    <Drawer
      className={styles.temporaryDrawer}
      variant="temporary"
      anchor="top"
      open={isNavigationOpen}
      onClose={handleNavigationToggle}
      classes={{
        paper: styles.drawerPaper,
      }}
    >
      {children}
    </Drawer>
  ) : (
    <Drawer
      className={styles.permanentDrawer}
      variant="permanent"
      open
      classes={{ paper: styles.drawerPaper }}
    >
      {children}
    </Drawer>
  );

  return (
    <>
      <nav className={styles.drawer}>{drawer}</nav>
    </>
  );
};
