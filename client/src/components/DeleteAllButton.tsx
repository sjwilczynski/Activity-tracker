import { Trash2 } from "lucide-react";
import { useState } from "react";
import { useFetcher } from "react-router";
import { useFeedbackToast } from "../hooks/useFeedbackToast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "./ui/alert-dialog";
import { Button } from "./ui/button";

type Props = {
  totalCount: number;
  disabled?: boolean;
  action?: string;
};

export const DeleteAllButton = ({
  totalCount,
  disabled = false,
  action = "/activity-list",
}: Props) => {
  const [isOpen, setIsOpen] = useState(false);

  const fetcher = useFetcher<{ ok?: boolean; error?: string }>();
  const isSuccess = fetcher.state === "idle" && fetcher.data?.ok === true;
  const isError = fetcher.state === "idle" && fetcher.data?.error !== undefined;

  useFeedbackToast(
    { isSuccess, isError },
    {
      successMessage: "Successfully deleted all activity data",
      errorMessage: "Failed to delete the activity data",
    }
  );

  const handleConfirm = () => {
    fetcher.submit({ intent: "delete-all" }, { method: "post", action });
    setIsOpen(false);
  };

  return (
    <>
      <Button
        variant="destructive"
        onClick={() => setIsOpen(true)}
        className="flex-1 sm:flex-none btn-icon-shake"
        disabled={disabled}
      >
        <Trash2 className="size-4 sm:mr-2" />
        <span className="hidden sm:inline">Delete All</span>
      </Button>

      <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete All Activities?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete all{" "}
              {totalCount} activities from your records.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction variant="destructive" onClick={handleConfirm}>
              Delete All
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
