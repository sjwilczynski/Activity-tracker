import { Upload } from "lucide-react";
import { FileUploadForm } from "./forms/FileUploadForm";
import { Button } from "./ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";

export const UploadButton = () => {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" className="flex-1 sm:flex-none">
          <Upload className="size-4 sm:mr-2" />
          <span className="hidden sm:inline">Upload</span>
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Import Data</DialogTitle>
          <DialogDescription>
            Select a JSON file containing activities, categories, and optionally
            preferences
          </DialogDescription>
        </DialogHeader>
        <FileUploadForm />
      </DialogContent>
    </Dialog>
  );
};
