import { Brightness4, Brightness7 } from "@mui/icons-material";
import { IconButton, Tooltip } from "@mui/material";
import { useThemeState } from "../../styles/StylesProvider";

export const ToggleThemeButton = () => {
  const [isLightTheme, toggleTheme] = useThemeState();
  return (
    <Tooltip title="Toggle light/dark theme">
      <IconButton onClick={toggleTheme} color="inherit" size="large">
        {isLightTheme ? <Brightness4 /> : <Brightness7 />}
      </IconButton>
    </Tooltip>
  );
};
