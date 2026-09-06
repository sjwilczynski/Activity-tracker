import { Pencil } from "lucide-react";
import { useRef, useState } from "react";
import {
  ActivityNameConflict,
  findRenameTarget,
  type NameTarget,
} from "../../../../shared/activity-names";
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
import { useActivities, useCategories } from "../../data";
import { useRenameActivity } from "../../data/mutations";
import { useFeedbackToast } from "../../hooks/useFeedbackToast";
import { MergeActivityConfirmation } from "./MergeActivityConfirmation";

export function EditActivityNameButton({
  activityName,
}: {
  activityName: string;
}) {
  const [newName, setNewName] = useState(activityName);
  const [confirmation, setConfirmation] = useState<
    (NameTarget & { count: number }) | null
  >(null);
  const [localError, setLocalError] = useState<string | null>(null);
  const { data: activities, error: activitiesError } = useActivities();
  const { data: categories, error: categoriesError } = useCategories();
  const mutation = useRenameActivity();
  const { isPending } = mutation;
  const closeRef = useRef<HTMLButtonElement>(null);
  const error =
    localError ??
    mutation.error?.message ??
    (activitiesError || categoriesError
      ? "Could not load activity names. Please try again."
      : undefined);

  const isValid =
    newName.trim().length > 0 &&
    newName.trim() !== activityName &&
    activities !== undefined &&
    categories !== undefined &&
    !activitiesError &&
    !categoriesError;

  useFeedbackToast(mutation, {
    successMessage: `Updated "${activityName}" successfully`,
    errorMessage: `Failed to rename "${activityName}"`,
    onSuccess: () => closeRef.current?.click(),
  });

  const submitName = (target?: NameTarget) => {
    if (isPending) return;
    mutation.mutate(
      target
        ? {
            oldName: activityName,
            newName: target.name,
            merge: true,
            targetCategoryId: target.categoryId,
          }
        : {
            oldName: activityName,
            newName: newName.trim(),
          }
    );
  };

  const handleSubmit = () => {
    if (isPending) return;
    if (!activities || !categories) {
      setLocalError("Activity names are not loaded. Please try again.");
      return;
    }
    try {
      const target = findRenameTarget(
        Object.fromEntries(activities.map((entry) => [entry.id, entry])),
        Object.fromEntries(
          categories.map((category) => [category.id, category])
        ),
        activityName,
        newName.trim()
      );
      if (target) {
        setConfirmation({
          ...target,
          count: activities.filter((entry) => entry.name === activityName)
            .length,
        });
      } else {
        submitName();
      }
    } catch (error) {
      if (!(error instanceof ActivityNameConflict)) throw error;
      setLocalError(error.message);
    }
  };

  return (
    <Dialog
      onOpenChange={(isOpen) => {
        if (isOpen && !isPending) {
          mutation.reset();
          setNewName(activityName);
          setConfirmation(null);
          setLocalError(null);
        }
      }}
    >
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          disabled={isPending}
          className="hover:bg-primary/10! hover:text-primary! hover:scale-110 active:scale-95 transition-all duration-150"
        >
          <Pencil className="size-4" />
          <span className="sr-only">Edit</span>
        </Button>
      </DialogTrigger>
      <DialogContent>
        {confirmation ? (
          <MergeActivityConfirmation
            activityName={activityName}
            target={confirmation}
            isPending={isPending}
            error={error}
            closeRef={closeRef}
            onBack={() => setConfirmation(null)}
            onConfirm={() => submitName(confirmation)}
          />
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>Edit Activity Name</DialogTitle>
              <DialogDescription>
                {`This will update all activities with the name "${activityName}"`}
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
                  onChange={(e) => {
                    setNewName(e.target.value);
                    setLocalError(null);
                  }}
                  disabled={isPending}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !isPending && isValid)
                      handleSubmit();
                  }}
                />
              </div>
            </div>
            {error && (
              <p role="alert" className="text-sm text-destructive">
                {error}
              </p>
            )}
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline" ref={closeRef} disabled={isPending}>
                  Cancel
                </Button>
              </DialogClose>
              <Button disabled={!isValid || isPending} onClick={handleSubmit}>
                {isPending ? "Updating..." : "Update Name"}
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
