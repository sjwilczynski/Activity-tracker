import { makeStyles } from "@material-ui/core";
import { Navigation } from "./navigation/Navigation";
import { useNavigationState } from "./navigation/useNavigationState";
import { AppBar } from "./AppBar";

type Props = {
  children: React.ReactNode;
};

const useStyles = makeStyles((theme) => {
  return {
    container: {
      display: "flex",
      flexDirection: "column",
    },
  };
});

export const AppContainer = ({ children }: Props) => {
  const styles = useStyles();
  const { isNavigationOpen, handleNavigationToggle } = useNavigationState();
  return (
    <>
      <div className={styles.container}>
        <AppBar handleNavigationToggle={handleNavigationToggle} />
        {children}
      </div>
      <Navigation
        isNavigationOpen={isNavigationOpen}
        handleNavigationToggle={handleNavigationToggle}
      />
    </>
  );
};
