import { Trash2 } from "lucide-react";
import { useRef } from "react";
import { useDeleteAllActivities } from "../data/mutations";
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
  AlertDialogTrigger,
} from "./ui/alert-dialog";
import { Button } from "./ui/button";

type Props = {
  totalCount: number;
  disabled?: boolean;
};

export const DeleteAllButton = ({ totalCount, disabled = false }: Props) => {
  const mutation = useDeleteAllActivities();
  const { isSuccess, isError, isPending } = mutation;
  const closeRef = useRef<HTMLButtonElement>(null);

  useFeedbackToast(
    { isSuccess, isError },
    {
      successMessage: "Successfully deleted all activity data",
      errorMessage: "Failed to delete the activity data",
      onSuccess: () => closeRef.current?.click(),
    }
  );

  const handleConfirm = (event: React.MouseEvent) => {
    event.preventDefault();
    if (!isPending) mutation.mutate();
  };

  return (
    <AlertDialog
      onOpenChange={(open) => {
        if (open && !isPending) mutation.reset();
      }}
    >
      <AlertDialogTrigger asChild>
        <Button
          variant="destructive"
          className="flex-1 sm:flex-none btn-icon-shake"
          disabled={disabled || isPending}
        >
          <Trash2 className="size-4 sm:mr-2" />
          <span className="hidden sm:inline">Delete All</span>
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete All Activities?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete all{" "}
            {totalCount} activities from your records.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel ref={closeRef} disabled={isPending}>
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            variant="destructive"
            onClick={handleConfirm}
            disabled={isPending}
          >
            {isPending ? "Deleting..." : "Delete All"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
