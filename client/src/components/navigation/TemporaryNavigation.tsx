import { createStyles, Drawer, makeStyles, Theme } from "@material-ui/core";
import * as React from "react";

type Props = {
  children: React.ReactNode;
  isNavigationOpen: boolean;
  handleNavigationToggle: () => void;
};

const useStyles = makeStyles((theme: Theme) => {
  return createStyles({
    navigation: {},
    drawerPaper: {
      width: "100%",
    },
    drawer: {},
  });
});

export const TemporaryNavigation = ({
  children,
  isNavigationOpen,
  handleNavigationToggle,
}: Props) => {
  const styles = useStyles();
  return (
    <nav className={styles.navigation}>
      <Drawer
        className={styles.drawer}
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
    </nav>
  );
};
