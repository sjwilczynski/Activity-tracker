import { IconButton, Tooltip } from "@material-ui/core";
import { Brightness4, Brightness7 } from "@material-ui/icons";
import { useAtom } from "jotai";
import { themeAtom } from "../../styles/StylesProvider";

export const ToggleThemeButton = () => {
  const [isLightTheme, toggleTheme] = useAtom(themeAtom);
  return (
    <Tooltip title="Toggle light/dark theme">
      <IconButton onClick={toggleTheme} color="inherit">
        {isLightTheme ? <Brightness4 /> : <Brightness7 />}
      </IconButton>
    </Tooltip>
  );
};
