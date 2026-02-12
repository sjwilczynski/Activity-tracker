import { useForm } from "@tanstack/react-form";
import { useEffect, useRef } from "react";
import type { ActivityRecordWithId, CategoryOption } from "../../../data";
import { useAvailableCategories } from "../../../data";
import { useFeedbackToast } from "../../../hooks/useFeedbackToast";
import {
  CategoryAutocomplete,
  DatePicker,
  getErrorMessage,
} from "../../forms/adapters";
import {
  categoryOptionSchema,
  dateSchema,
  type ActivityFormValues,
} from "../../forms/schemas";
import { Button } from "../../ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../ui/dialog";
import { useEditActivityFormSubmit } from "./useEditActivityFormSubmit";

type Props = {
  record: ActivityRecordWithId;
  isOpen: boolean;
  onClose: () => void;
};

export const EditActivityDialog = ({ record, isOpen, onClose }: Props) => {
  const { onSubmit, isSuccess, isError, isPending } = useEditActivityFormSubmit(
    record.id
  );
  const { availableCategories } = useAvailableCategories();
  useCancelOnSuccess(isSuccess, onClose);

  useFeedbackToast(
    { isSuccess, isError },
    {
      successMessage: "Successfully edited activity",
      errorMessage: "Failed to edit activity",
    }
  );

  const initialCategory: CategoryOption = {
    name: record.name,
    categoryName:
      availableCategories.find((category) => category.name === record.name)
        ?.categoryName ?? "",
    active: record.active,
  };

  const form = useForm({
    defaultValues: {
      date: record.date,
      category: initialCategory,
    } as ActivityFormValues,
    onSubmit: ({ value }) => {
      onSubmit(value);
    },
  });

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Activity</DialogTitle>
          <DialogDescription>
            Make changes to your activity details
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <form.Field
            name="date"
            validators={{
              onChange: dateSchema,
            }}
          >
            {(field) => (
              <DatePicker
                value={field.state.value}
                onChange={field.handleChange}
                onBlur={field.handleBlur}
                error={getErrorMessage(field.state.meta.errors)}
                label="Date"
              />
            )}
          </form.Field>
          <form.Field
            name="category"
            validators={{
              onChange: categoryOptionSchema,
            }}
          >
            {(field) => (
              <CategoryAutocomplete
                value={field.state.value}
                onChange={field.handleChange}
                onBlur={field.handleBlur}
                error={getErrorMessage(field.state.meta.errors)}
                label="Activity name"
              />
            )}
          </form.Field>
        </div>
        <DialogFooter>
          <form.Subscribe
            selector={(state) => [state.canSubmit, state.isDirty]}
          >
            {([canSubmit, isDirty]) => (
              <>
                <Button
                  variant="outline"
                  onClick={onClose}
                  disabled={isPending}
                >
                  Cancel
                </Button>
                <Button
                  variant="gradient"
                  disabled={!canSubmit || !isDirty || isPending}
                  onClick={() => form.handleSubmit()}
                >
                  {isPending ? "Saving..." : "Save Changes"}
                </Button>
              </>
            )}
          </form.Subscribe>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

const useCancelOnSuccess = (isSuccess: boolean, onCancel: () => void) => {
  const successRef = useRef(isSuccess);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const onCancelRef = useRef(onCancel);
  onCancelRef.current = onCancel;
  useEffect(() => {
    if (isSuccess && !successRef.current) {
      timeoutRef.current = setTimeout(() => onCancelRef.current(), 1500);
    }
    successRef.current = isSuccess;
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [isSuccess]);
};
