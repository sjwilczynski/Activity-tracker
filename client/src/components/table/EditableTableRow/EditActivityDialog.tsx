import { useForm } from "@tanstack/react-form";
import { Pencil } from "lucide-react";
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
  type DetailedActivityFormValues,
} from "../../forms/schemas";
import { Button } from "../../ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../../ui/dialog";
import { Input } from "../../ui/input";
import { Label } from "../../ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../ui/select";
import { Textarea } from "../../ui/textarea";
import { useEditActivityFormSubmit } from "./useEditActivityFormSubmit";

type Props = {
  record: ActivityRecordWithId;
  disabled?: boolean;
};

export const EditActivityButton = ({ record, disabled }: Props) => {
  const { onSubmit, isSuccess, isError, isPending } = useEditActivityFormSubmit(
    record.id
  );
  const { availableCategories } = useAvailableCategories();
  const closeRef = useRef<HTMLButtonElement>(null);
  useCloseOnSuccess(isSuccess, closeRef);

  useFeedbackToast(
    { isSuccess, isError },
    {
      successMessage: "Successfully edited activity",
      errorMessage: "Failed to edit activity",
    }
  );

  const matchedCategory = availableCategories.find(
    (option) =>
      option.categoryId === record.categoryId && option.name === record.name
  );
  const initialCategory: CategoryOption = {
    name: record.name,
    categoryName: matchedCategory?.categoryName ?? "",
    categoryId: record.categoryId,
    active: record.active,
  };

  const form = useForm({
    defaultValues: {
      date: record.date,
      category: initialCategory,
      intensity: record.intensity ?? "",
      timeSpent: record.timeSpent?.toString() ?? "",
      description: record.description ?? "",
    } as DetailedActivityFormValues,
    onSubmit: ({ value }) => {
      onSubmit(value);
    },
  });

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="hover:bg-primary/10! hover:text-primary! hover:scale-110 active:scale-95 transition-all duration-150"
          disabled={disabled}
        >
          <Pencil />
          <span className="sr-only">Edit</span>
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Activity</DialogTitle>
          <DialogDescription>
            Make changes to your activity details
          </DialogDescription>
        </DialogHeader>
        <form
          className="space-y-4 py-4"
          onSubmit={(e) => {
            e.preventDefault();
            form.handleSubmit();
          }}
        >
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
          <form.Field name="intensity">
            {(field) => (
              <div className="space-y-2">
                <Label htmlFor="edit-intensity">Intensity</Label>
                <Select
                  value={field.state.value}
                  onValueChange={(v) => field.handleChange(v as "" | "low" | "medium" | "high")}
                >
                  <SelectTrigger id="edit-intensity">
                    <SelectValue placeholder="None" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </form.Field>
          <form.Field name="timeSpent">
            {(field) => (
              <div className="space-y-2">
                <Label htmlFor="edit-time">Time Spent</Label>
                <Input
                  id="edit-time"
                  type="number"
                  min={0}
                  placeholder="e.g., 30"
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  onBlur={field.handleBlur}
                />
              </div>
            )}
          </form.Field>
          <form.Field name="description">
            {(field) => (
              <div className="space-y-2">
                <Label htmlFor="edit-description">Description</Label>
                <Textarea
                  id="edit-description"
                  placeholder="Add notes..."
                  rows={3}
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  onBlur={field.handleBlur}
                />
              </div>
            )}
          </form.Field>
          <DialogFooter>
            <form.Subscribe
              selector={(state) => [state.canSubmit, state.isDirty]}
            >
              {([canSubmit, isDirty]) => (
                <>
                  <DialogClose asChild>
                    <Button
                      type="button"
                      variant="outline"
                      disabled={isPending}
                      ref={closeRef}
                    >
                      Cancel
                    </Button>
                  </DialogClose>
                  <Button
                    type="submit"
                    variant="gradient"
                    disabled={!canSubmit || !isDirty || isPending}
                  >
                    {isPending ? "Saving..." : "Save Changes"}
                  </Button>
                </>
              )}
            </form.Subscribe>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

/** Programmatically close the dialog after a successful save */
const useCloseOnSuccess = (
  isSuccess: boolean,
  closeRef: React.RefObject<HTMLButtonElement | null>
) => {
  const prevRef = useRef(isSuccess);
  useEffect(() => {
    if (isSuccess && !prevRef.current) {
      const timer = setTimeout(() => closeRef.current?.click(), 1500);
      return () => clearTimeout(timer);
    }
    prevRef.current = isSuccess;
  }, [isSuccess, closeRef]);
};
