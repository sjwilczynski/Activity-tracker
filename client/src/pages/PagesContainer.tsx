import { makeStyles } from "@material-ui/core";
import * as React from "react";

type Props = {
  children: React.ReactNode;
};

const useStyles = makeStyles({
  container: {
    flexDirection: "column",
    display: "flex",
    width: "70%",
  },
});

export const PagesContainer = ({ children }: Props) => {
  const styles = useStyles();
  return <div className={styles.container}>{children}</div>;
};
