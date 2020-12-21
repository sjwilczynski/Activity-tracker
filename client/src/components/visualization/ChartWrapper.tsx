import { makeStyles } from "@material-ui/core";
import { ReactNode } from "react";

type Props = {
  children: ReactNode;
};

const useStyles = makeStyles({
  chartContainer: {
    position: "relative",
    minHeight: "50vh",
  },
  sizing: {
    minWidth: 570,
    padding: "0 2rem",
  },
});

export const ChartWrapper = ({ children }: Props) => {
  const styles = useStyles();
  return (
    <div className={styles.sizing}>
      <div className={styles.chartContainer}>{children}</div>
    </div>
  );
};
