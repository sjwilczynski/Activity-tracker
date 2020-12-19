import { makeStyles } from "@material-ui/core";
import { ReactNode } from "react";

type Props = {
  children: ReactNode;
};

const useStyles = makeStyles((theme) => ({
  chartContainer: {
    minHeight: "50vh",
    minWidth: 500,
    position: "relative",
  },
}));

export const ChartWrapper = ({ children }: Props) => {
  const styles = useStyles();
  return <div className={styles.chartContainer}>{children}</div>;
};
