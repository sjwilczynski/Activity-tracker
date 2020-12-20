import { IconButton, makeStyles } from "@material-ui/core";
import { Brightness4, Brightness7 } from "@material-ui/icons";
import { useAtom } from "jotai";
import { themeAtom } from "./StylesProvider";

const useStyles = makeStyles((theme) => {
  return {
    button: {
      color: theme.palette.common.white,
    },
  };
});

export const ToggleThemeButton = () => {
  const styles = useStyles();
  const [isLightTheme, toggleTheme] = useAtom(themeAtom);
  return (
    <IconButton
      onClick={toggleTheme}
      className={styles.button}
      title="Toggle light/dark theme"
    >
      {isLightTheme ? <Brightness4 /> : <Brightness7 />}
    </IconButton>
  );
};
