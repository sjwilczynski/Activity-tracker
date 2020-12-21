import { makeStyles, useMediaQuery, useTheme } from "@material-ui/core";
import { ToggleThemeButton } from "./ToggleThemeButton";
import { GitHubLinkButton } from "./GitHubLinkButton";
import { AdditionalMenu } from "./AdditionalMenu";

const useStyles = makeStyles({
  buttons: {
    display: "flex",
    position: "absolute",
    top: 10,
    right: 10,
  },
});

export const AppBarButtons = () => {
  const styles = useStyles();
  const matches = useMediaQuery(useTheme().breakpoints.down("sm"));
  return matches ? (
    <AdditionalMenu>
      <GitHubLinkButton />
      <ToggleThemeButton />
    </AdditionalMenu>
  ) : (
    <div className={styles.buttons}>
      <GitHubLinkButton />
      <ToggleThemeButton />
    </div>
  );
};
