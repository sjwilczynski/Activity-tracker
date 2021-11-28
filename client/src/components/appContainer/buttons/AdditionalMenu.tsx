import { Menu, MenuItem } from "@mui/material";
import makeStyles from "@mui/styles/makeStyles";
import { useState, ReactNodeArray, MouseEvent } from "react";
import { AdditionalMenuButton } from "./AdditionalMenuButton";

type Props = {
  children: ReactNodeArray;
};

const useStyles = makeStyles({
  menuList: {
    padding: 0,
  },
});

export const AdditionalMenu = ({ children }: Props) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleClick = (event: MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };
  const styles = useStyles();

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
        MenuListProps={{ className: styles.menuList }}
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
