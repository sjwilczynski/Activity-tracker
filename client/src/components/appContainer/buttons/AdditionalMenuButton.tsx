import { IconButton, Tooltip } from "@mui/material";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import { MouseEvent } from "react";

type Props = {
  onClick: (event: MouseEvent<HTMLButtonElement>) => void;
};

export const AdditionalMenuButton = ({ onClick }: Props) => (
  <Tooltip title="Open additonal menu">
    <IconButton
      aria-label="more"
      aria-haspopup="true"
      aria-controls="additional-menu"
      color="inherit"
      onClick={onClick}
      size="large"
    >
      <MoreVertIcon />
    </IconButton>
  </Tooltip>
);
