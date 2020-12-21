import { IconButton, Tooltip } from "@material-ui/core";
import MenuIcon from "@material-ui/icons/Menu";
import { useAuth } from "../../../auth";
import { useNavigationToggle } from "../../navigation/useNavigationState";

export const NavigationMenuButton = () => {
  const toggleNavigation = useNavigationToggle();
  const { isSignedIn } = useAuth();
  const onClick = isSignedIn ? toggleNavigation : undefined;
  return (
    <Tooltip title="Expand/collapse navigation menu">
      <IconButton color="inherit" onClick={onClick}>
        <MenuIcon />
      </IconButton>
    </Tooltip>
  );
};
