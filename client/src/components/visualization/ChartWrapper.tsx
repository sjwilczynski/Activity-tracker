import { makeStyles } from "@material-ui/core";
import { ReactNode } from "react";

type Props = {
  children: ReactNode;
};

const useStyles = makeStyles((theme) => ({
  chartContainer: {
    minHeight: "40vh",
  },
}));

export const ChartWrapper = ({ children }: Props) => {
  const styles = useStyles();
  return <div className={styles.chartContainer}>{children}</div>;
};
