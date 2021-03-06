import {
  Button,
  Dialog,
  DialogContent,
  DialogContentText,
  DialogTitle,
  IconButton,
  makeStyles,
  Typography,
} from "@material-ui/core";
import CloseIcon from "@material-ui/icons/Close";
import { useState } from "react";

type Props = {
  description?: string;
  content: React.ReactNode;
  title?: string;
  disabled?: boolean;
  openButtonText: string;
};

const useStyles = makeStyles((theme) => ({
  dialog: {
    border: `10px solid ${theme.palette.primary.main}`,
    borderRadius: "5px",
  },
  closeButton: {
    position: "absolute",
    right: theme.spacing(1),
    top: theme.spacing(1),
  },
  content: {
    display: "flex",
    flexDirection: "column",
  },
}));

export const ModalDialog = (props: Props) => {
  const {
    description,
    content,
    title,
    openButtonText,
    disabled = false,
  } = props;
  const [isOpen, setIsOpen] = useState<boolean>(false);

  const open = () => {
    setIsOpen(true);
  };

  const close = () => {
    setIsOpen(false);
  };
  const styles = useStyles();
  return (
    <>
      <Button
        variant="contained"
        color="primary"
        onClick={open}
        disabled={disabled}
      >
        {openButtonText}
      </Button>
      <Dialog
        open={isOpen}
        onClose={close}
        PaperProps={{ className: styles.dialog }}
        fullWidth={true}
      >
        <DialogTitle>
          {title && <Typography variant="h5">{title}</Typography>}
          <IconButton
            aria-label="close"
            className={styles.closeButton}
            onClick={close}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent className={styles.content}>
          {description && (
            <DialogContentText>
              <Typography variant="h6">{description}</Typography>
            </DialogContentText>
          )}
          {content}
        </DialogContent>
      </Dialog>
    </>
  );
};
