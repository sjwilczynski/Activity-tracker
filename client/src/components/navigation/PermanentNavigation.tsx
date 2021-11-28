import { Drawer, Theme, styled } from "@mui/material";
import { SxProps } from "@mui/system";

type Props = {
  children: React.ReactNode;
};

const drawerWidth = "17rem";

const Navigation = styled("nav")({ width: drawerWidth });
const drawerStyles: SxProps<Theme> = {
  "& .MuiDrawer-paper": {
    width: drawerWidth,
    height: "100vh",
    backgroundColor: "primary.main",
    border: "none",
    display: "flex",
    justifyContent: "center",
  },
};

export const PermanentNavigation = ({ children }: Props) => {
  return (
    <Navigation>
      <Drawer variant="permanent" open sx={drawerStyles}>
        {children}
      </Drawer>
    </Navigation>
  );
};
