import CloseIcon from "@mui/icons-material/Close";
import type { Theme } from "@mui/material";
import {
  Button,
  Dialog,
  DialogContent,
  DialogContentText,
  DialogTitle,
  IconButton,
  Typography,
} from "@mui/material";
import type { SxProps } from "@mui/system";
import { useState } from "react";

type Props = {
  description?: string;
  content: React.ReactNode;
  title?: string;
  disabled?: boolean;
  openButtonText: string;
};

const mainDialogStyles: SxProps<Theme> = {
  border: 10,
  borderColor: "primary.main",
};

const closeButtonStyles: SxProps<Theme> = {
  position: "absolute",
  right: 4,
  top: 4,
};

const contentStyles: SxProps<Theme> = {
  display: "flex",
  flexDirection: "column",
};

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
        PaperProps={{
          sx: mainDialogStyles,
        }}
        fullWidth={true}
      >
        <DialogTitle>
          {title && <Typography variant="h5">{title}</Typography>}
          <IconButton
            aria-label="close"
            sx={closeButtonStyles}
            onClick={close}
            size="large"
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={contentStyles}>
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
