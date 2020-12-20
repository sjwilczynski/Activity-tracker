import { IconButton, Tooltip } from "@material-ui/core";
import MenuIcon from "@material-ui/icons/Menu";

type Props = {
  handleNavigationToggle: () => void;
};

export const NavigationMenuButton = ({ handleNavigationToggle }: Props) => (
  <Tooltip title="Expand/collapse navigation menu">
    <IconButton color="inherit" onClick={handleNavigationToggle}>
      <MenuIcon />
    </IconButton>
  </Tooltip>
);
