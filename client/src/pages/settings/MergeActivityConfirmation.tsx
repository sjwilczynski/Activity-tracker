import type { Ref } from "react";
import type { NameTarget } from "../../../../shared/activity-names";
import { Button } from "../../components/ui/button";
import {
  DialogClose,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../components/ui/dialog";

type Props = {
  activityName: string;
  target: NameTarget & { count: number };
  isPending: boolean;
  error?: string;
  closeRef: Ref<HTMLButtonElement>;
  onBack: () => void;
  onConfirm: () => void;
};

export function MergeActivityConfirmation({
  activityName,
  target,
  isPending,
  error,
  closeRef,
  onBack,
  onConfirm,
}: Props) {
  return (
    <>
      <DialogHeader>
        <DialogTitle>Merge activity history</DialogTitle>
        <DialogDescription>
          {`Move ${target.count} entries from "${activityName}" to "${target.name}" in "${target.categoryName}"?`}
        </DialogDescription>
      </DialogHeader>
      <p className="text-sm">
        Dates and details are preserved. No entries are deleted or deduplicated.
        The old activity name is removed; other names in its category are
        unchanged.
      </p>
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
        <Button variant="outline" disabled={isPending} onClick={onBack}>
          Back
        </Button>
        <Button disabled={isPending} onClick={onConfirm}>
          {isPending ? "Merging..." : "Confirm merge"}
        </Button>
      </DialogFooter>
    </>
  );
}
