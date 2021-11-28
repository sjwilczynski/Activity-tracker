import { Drawer, Theme } from "@mui/material";
import createStyles from "@mui/styles/createStyles";
import makeStyles from "@mui/styles/makeStyles";
import { useNavigationState } from "./useNavigationState";

type Props = {
  children: React.ReactNode;
};

const useStyles = makeStyles((theme: Theme) => {
  return createStyles({
    drawerPaper: {
      width: "100%",
      background: theme.palette.primary.main,
    },
  });
});

export const TemporaryNavigation = ({ children }: Props) => {
  const styles = useStyles();
  const [isNavigationOpen, toggleNavigation] = useNavigationState();
  return (
    <nav>
      <Drawer
        variant="temporary"
        anchor="top"
        open={isNavigationOpen}
        onClose={toggleNavigation}
        classes={{
          paper: styles.drawerPaper,
        }}
      >
        {children}
      </Drawer>
    </nav>
  );
};
