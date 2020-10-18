import { AppBar, IconButton, makeStyles, Toolbar } from "@material-ui/core";
import MenuIcon from "@material-ui/icons/Menu";
import * as React from "react";

type Props = {
  children: React.ReactNode;
  handleNavigationToggle: () => void;
};

const useStyles = makeStyles({
  container: {
    display: "flex",
  },
});

export const AppContainer = ({ handleNavigationToggle, children }: Props) => {
  const styles = useStyles();
  return (
    <div className={styles.container}>
      <AppBar position="fixed">
        <Toolbar>
          <IconButton color="inherit" onClick={handleNavigationToggle}>
            <MenuIcon />
          </IconButton>
        </Toolbar>
      </AppBar>
      {children}
    </div>
  );
};
