import { IconButton, Tooltip } from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import { useAuth } from "../../../auth";
import { useNavigationToggle } from "../../navigation/useNavigationState";

export const NavigationMenuButton = () => {
  const toggleNavigation = useNavigationToggle();
  const { isSignedIn } = useAuth();
  const onClick = isSignedIn ? toggleNavigation : undefined;
  return (
    <Tooltip title="Expand/collapse navigation menu">
      <IconButton color="inherit" onClick={onClick} size="large">
        <MenuIcon />
      </IconButton>
    </Tooltip>
  );
};
