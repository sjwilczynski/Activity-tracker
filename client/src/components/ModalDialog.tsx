import {
  Button,
  Dialog,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from "@material-ui/core";
import * as React from "react";

type Props = {
  description: string;
  content: React.ReactNode;
  title: string;
  openButtonText: string;
};

export const ModalDialog = (props: Props) => {
  const { description, content, title, openButtonText } = props;
  const [isOpen, setIsOpen] = React.useState<boolean>(false);

  const open = () => {
    setIsOpen(true);
  };

  const close = () => {
    setIsOpen(false);
  };
  return (
    <div>
      <Button variant="outlined" color="primary" onClick={open}>
        {openButtonText}
      </Button>
      <Dialog open={isOpen} onClose={close}>
        <DialogTitle>{title}</DialogTitle>
        <DialogContent>
          <DialogContentText>{description}</DialogContentText>
          {content}
        </DialogContent>
      </Dialog>
    </div>
  );
};
