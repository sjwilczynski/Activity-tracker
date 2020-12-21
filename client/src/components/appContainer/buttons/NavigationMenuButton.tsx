import { IconButton, Tooltip } from "@material-ui/core";
import MenuIcon from "@material-ui/icons/Menu";
import { useNavigationToggle } from "../../navigation/useNavigationState";

export const NavigationMenuButton = () => {
  const toggleNavigation = useNavigationToggle();
  return (
    <Tooltip title="Expand/collapse navigation menu">
      <IconButton color="inherit" onClick={toggleNavigation}>
        <MenuIcon />
      </IconButton>
    </Tooltip>
  );
};
