import { IconButton, Tooltip } from "@mui/material";
import GitHub from "@mui/icons-material/GitHub";

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
