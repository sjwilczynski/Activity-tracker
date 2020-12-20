import { IconButton, Tooltip } from "@material-ui/core";
import GitHub from "@material-ui/icons/GitHub";

export const GitHubLinkButton = () => (
  <Tooltip title="Github repository">
    <IconButton
      href="https://github.com/sjwilczynski/Activity-tracker"
      color="inherit"
    >
      <GitHub />
    </IconButton>
  </Tooltip>
);
