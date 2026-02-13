import { Upload } from "lucide-react";
import { useState } from "react";
import { FileUploadForm } from "./forms/FileUploadForm";
import { Button } from "./ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";

export const UploadButton = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <Button
        variant="outline"
        className="flex-1 sm:flex-none"
        onClick={() => setIsOpen(true)}
      >
        <Upload className="size-4 sm:mr-2" />
        <span className="hidden sm:inline">Upload</span>
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Activities Upload</DialogTitle>
            <DialogDescription>
              Select a JSON file containing activities in a compliant format
            </DialogDescription>
          </DialogHeader>
          <FileUploadForm />
        </DialogContent>
      </Dialog>
    </>
  );
};
