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
import * as React from "react";

type Props = {
  description?: string;
  content: React.ReactNode;
  title?: string;
  openButtonText: string;
};

const useStyles = makeStyles((theme) => {
  return {
    dialog: {
      border: `10px solid ${theme.palette.primary.main}`,
      borderRadius: "5px",
    },
    closeButton: {
      position: "absolute",
      right: theme.spacing(1),
      top: theme.spacing(1),
    },
  };
});

export const ModalDialog = (props: Props) => {
  const { description, content, title, openButtonText } = props;
  const [isOpen, setIsOpen] = React.useState<boolean>(false);

  const open = () => {
    setIsOpen(true);
  };

  const close = () => {
    setIsOpen(false);
  };
  const styles = useStyles();
  return (
    <div>
      <Button variant="contained" color="primary" onClick={open}>
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
        <DialogContent>
          {description && (
            <DialogContentText>
              <Typography variant="h6">{description}</Typography>
            </DialogContentText>
          )}
          {content}
        </DialogContent>
      </Dialog>
    </div>
  );
};
