import { makeStyles, Menu, MenuItem } from "@material-ui/core";
import { useState, ReactNodeArray, MouseEvent } from "react";
import { AdditionalMenuButton } from "./AdditionalMenuButton";

type Props = {
  children: ReactNodeArray;
};

const useStyles = makeStyles((theme) => ({
  menuList: {
    padding: 0,
  },
}));

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
        getContentAnchorEl={null}
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
        {children.map((child) => (
          <MenuItem disableGutters>{child}</MenuItem>
        ))}
      </Menu>
    </>
  );
};
