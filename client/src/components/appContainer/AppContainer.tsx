import { makeStyles } from "@material-ui/core";
import { Navigation } from "../navigation/Navigation";
import { AppBar } from "./AppBar";

type Props = {
  children: React.ReactNode;
};

const useStyles = makeStyles({
  container: {
    display: "flex",
    flexDirection: "column",
    minWidth: 400,
  },
});

export const AppContainer = ({ children }: Props) => {
  const styles = useStyles();
  return (
    <>
      <div className={styles.container}>
        <AppBar />
        {children}
      </div>
      <Navigation />
    </>
  );
};
