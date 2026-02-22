import { Pencil } from "lucide-react";
import { useRef, useState } from "react";
import { useFetcher } from "react-router";
import { Button } from "../../components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../../components/ui/dialog";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { useFeedbackToast } from "../../hooks/useFeedbackToast";

export function EditActivityNameButton({
  activityName,
}: {
  activityName: string;
}) {
  const [newName, setNewName] = useState(activityName);
  const fetcher = useFetcher<{ ok?: boolean; error?: string }>();
  const isPending = fetcher.state !== "idle";
  const closeRef = useRef<HTMLButtonElement>(null);

  const isValid = newName.trim().length > 0 && newName.trim() !== activityName;

  useFeedbackToast(
    {
      isSuccess: fetcher.state === "idle" && fetcher.data?.ok === true,
      isError: fetcher.state === "idle" && fetcher.data?.error !== undefined,
    },
    {
      successMessage: `Renamed "${activityName}" successfully`,
      errorMessage: `Failed to rename "${activityName}"`,
      onSuccess: () => closeRef.current?.click(),
    }
  );

  const handleSubmit = () => {
    fetcher.submit(
      {
        intent: "rename-activity",
        oldName: activityName,
        newName: newName.trim(),
      },
      { method: "post" }
    );
  };

  return (
    <Dialog
      onOpenChange={(isOpen) => {
        if (isOpen) setNewName(activityName);
      }}
    >
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="hover:bg-primary/10! hover:text-primary! hover:scale-110 active:scale-95 transition-all duration-150"
        >
          <Pencil className="size-4" />
          <span className="sr-only">Edit</span>
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Activity Name</DialogTitle>
          <DialogDescription>
            This will update all activities with the name &quot;{activityName}
            &quot;
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor={`edit-name-${activityName}`}>
              New Activity Name
            </Label>
            <Input
              id={`edit-name-${activityName}`}
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !isPending && isValid) handleSubmit();
              }}
            />
          </div>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline" ref={closeRef}>
              Cancel
            </Button>
          </DialogClose>
          <Button disabled={!isValid || isPending} onClick={handleSubmit}>
            {isPending ? "Updating..." : "Update Name"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
