import { makeStyles, useTheme } from "@material-ui/core";
import * as React from "react";

type Props = {
  children: React.ReactNode;
};

const useStyles = makeStyles((theme) => {
  return {
    container: {
      flexDirection: "column",
      display: "flex",
      width: "80%",
      height: "100vh",
      [theme.breakpoints.down("sm")]: {
        width: "100%",
      },
    },
    toolbar: theme.mixins.toolbar,
  };
});

export const PagesContainer = ({ children }: Props) => {
  const styles = useStyles(useTheme());
  return (
    <div className={styles.container}>
      <div className={styles.toolbar} />
      {children}
    </div>
  );
};
