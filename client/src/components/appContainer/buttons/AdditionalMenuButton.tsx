import { IconButton, Tooltip } from "@material-ui/core";
import MoreVertIcon from "@material-ui/icons/MoreVert";
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
    >
      <MoreVertIcon />
    </IconButton>
  </Tooltip>
);
