import { Menu, MenuItem } from "@mui/material";
import { useState, MouseEvent, ReactNode } from "react";
import { AdditionalMenuButton } from "./AdditionalMenuButton";

type Props = {
  children: ReactNode[];
};

export const AdditionalMenu = ({ children }: Props) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleClick = (event: MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <>
      <AdditionalMenuButton onClick={handleClick} />
      <Menu
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "right",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "center",
        }}
        id="additional-menu"
        anchorEl={anchorEl}
        keepMounted
        open={Boolean(anchorEl)}
        onClose={handleClose}
        MenuListProps={{ sx: { p: 0 } }}
      >
        {children.map((child, index) => (
          <MenuItem key={index} disableGutters>
            {child}
          </MenuItem>
        ))}
      </Menu>
    </>
  );
};
