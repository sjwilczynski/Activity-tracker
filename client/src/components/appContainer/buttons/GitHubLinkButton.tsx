import GitHub from "@mui/icons-material/GitHub";
import { IconButton, Tooltip } from "@mui/material";

export const GitHubLinkButton = () => (
  <Tooltip title="Github repository">
    <IconButton
      href="https://github.com/sjwilczynski/Activity-tracker"
      color="inherit"
      size="large"
    >
      <GitHub />
    </IconButton>
  </Tooltip>
);
