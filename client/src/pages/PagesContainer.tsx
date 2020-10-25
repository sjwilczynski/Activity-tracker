import { makeStyles } from "@material-ui/core";
import * as React from "react";

type Props = {
  children: React.ReactNode;
};

const useStyles = makeStyles((theme) => {
  return {
    container: {
      padding: "2rem",
      flexDirection: "column",
      display: "flex",
      width: "80%",
      marginLeft: "20%",
      [theme.breakpoints.down("sm")]: {
        width: "100%",
        marginLeft: "0",
      },
    },
  };
});

export const PagesContainer = ({ children }: Props) => {
  const styles = useStyles();
  return <div className={styles.container}>{children}</div>;
};
