import { makeStyles } from "@material-ui/core";
import * as React from "react";

type Props = {
  children: React.ReactNode;
};

const useStyles = makeStyles({
  container: {
    display: "flex",
  },
});

export const AppContainer = ({ children }: Props) => {
  const styles = useStyles();
  return <div className={styles.container}>{children}</div>;
};
