import { Drawer, Theme } from "@mui/material";
import { SxProps } from "@mui/system";
import { useNavigationState } from "./useNavigationState";

type Props = {
  children: React.ReactNode;
};

const drawerStyles: SxProps<Theme> = {
  "& .MuiDrawer-paper": {
    width: "100%",
    backgroundColor: "primary.main",
  },
};

export const TemporaryNavigation = ({ children }: Props) => {
  const [isNavigationOpen, toggleNavigation] = useNavigationState();
  return (
    <nav>
      <Drawer
        variant="temporary"
        anchor="top"
        open={isNavigationOpen}
        onClose={toggleNavigation}
        sx={drawerStyles}
      >
        {children}
      </Drawer>
    </nav>
  );
};
