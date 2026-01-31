import { Close } from "@mui/icons-material";
import type { DrawerProps, Theme } from "@mui/material";
import { Drawer, IconButton } from "@mui/material";
import type { SxProps } from "@mui/system";
import { useNavigationState } from "./useNavigationState";

type Props = {
  variant: DrawerProps["variant"];
  children: React.ReactNode;
};

const closeButtonStyles: SxProps<Theme> = {
  position: "absolute",
  top: 16,
  left: 16,
  color: "common.white",

  display: { xs: "flex", md: "none" },
};
const drawerStyles: SxProps<Theme> = {
  position: "sticky",
  top: 0,
  width: { xs: "17rem", md: "auto" },
  "& .MuiDrawer-paper": {
    position: "relative",
    top: 0,
    height: "100vh",
    backgroundColor: "primary.main",
    border: "none",
    display: "flex",
    justifyContent: "center",
  },
};

export const NavigationDrawer = ({ variant, children }: Props) => {
  const [isNavigationOpen, toggleNavigation] = useNavigationState();

  return (
    <Drawer
      variant={variant}
      open={isNavigationOpen || variant === "permanent"}
      onClose={toggleNavigation}
      sx={drawerStyles}
    >
      <IconButton sx={closeButtonStyles} onClick={toggleNavigation}>
        <Close />
      </IconButton>
      {children}
    </Drawer>
  );
};
