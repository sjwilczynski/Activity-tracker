import { createStyles, Drawer, makeStyles, Theme } from "@material-ui/core";

type Props = {
  children: React.ReactNode;
  isNavigationOpen: boolean;
  handleNavigationToggle: () => void;
};

const useStyles = makeStyles((theme: Theme) => {
  return createStyles({
    drawerPaper: {
      width: "100%",
      background: theme.palette.primary.main,
    },
  });
});

export const TemporaryNavigation = ({
  children,
  isNavigationOpen,
  handleNavigationToggle,
}: Props) => {
  const styles = useStyles();
  return (
    <nav>
      <Drawer
        variant="temporary"
        anchor="top"
        open={isNavigationOpen}
        onClose={handleNavigationToggle}
        classes={{
          paper: styles.drawerPaper,
        }}
      >
        {children}
      </Drawer>
    </nav>
  );
};
