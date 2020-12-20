import { makeStyles } from "@material-ui/core";
import { ToggleThemeButton } from "./ToggleThemeButton";
import { GitHubLinkButton } from "./GitHubLinkButton";

const useStyles = makeStyles((theme) => {
  return {
    buttons: {
      display: "flex",
      color: theme.palette.primary.main,
      [theme.breakpoints.down("sm")]: {
        color: theme.palette.common.white,
      },
      [theme.breakpoints.up("sm")]: {
        position: "absolute",
        top: 10,
        right: 10,
      },
    },
  };
});

export const AppBarButtons = () => {
  const styles = useStyles();
  return (
    <div className={styles.buttons}>
      <GitHubLinkButton />
      <ToggleThemeButton />
    </div>
  );
};
