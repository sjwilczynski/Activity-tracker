import {
  Alert,
  AlertColor,
  Snackbar,
  SnackbarOrigin,
  Slide,
} from "@mui/material";
import { TransitionProps } from "@mui/material/transitions";
import { SyntheticEvent, Dispatch, SetStateAction } from "react";

type Props = {
  open: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
  message: string;
  severity: AlertColor;
};

export const FeedbackAlert = ({ open, setOpen, severity, message }: Props) => {
  const handleClose = (event?: SyntheticEvent, reason?: string) => {
    if (reason === "clickaway") {
      return;
    }
    setOpen(false);
  };

  return (
    <Snackbar
      open={open}
      onClose={handleClose}
      anchorOrigin={anchorOrigin}
      TransitionComponent={TransitionLeft}
      autoHideDuration={5000}
    >
      <Alert
        onClose={handleClose}
        severity={severity}
        elevation={6}
        variant="filled"
        key={message}
      >
        {message}
      </Alert>
    </Snackbar>
  );
};

const anchorOrigin: SnackbarOrigin = {
  horizontal: "right",
  vertical: "bottom",
};

const TransitionLeft = (
  props: TransitionProps & { children: React.ReactElement<any, any> }
) => {
  return <Slide {...props} direction="left" />;
};
