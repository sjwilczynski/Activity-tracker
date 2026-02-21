import { useForm } from "@tanstack/react-form";
import { addDays, format } from "date-fns";
import { Plus } from "lucide-react";
import { useRef } from "react";
import { useFetcher } from "react-router";
import type {
  ActivityRecordServer,
  ActivityRecordWithId,
  Intensity,
} from "../../../data";
import { useFeedbackToast } from "../../../hooks/useFeedbackToast";
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
import {
  CategoryAutocomplete,
  DatePicker,
  getErrorMessage,
} from "../adapters";
import {
  categoryOptionSchema,
  dateSchema,
  type DetailedActivityFormValues,
} from "../schemas";

const emptyCategory = {
  name: "",
  active: false,
  categoryName: "",
  categoryId: "",
};

type Props = {
  lastActivity: ActivityRecordWithId | undefined;
};

export function AddWithDetailsDialog({ lastActivity }: Props) {
  const closeRef = useRef<HTMLButtonElement>(null);
  const fetcher = useFetcher<{ ok?: boolean; error?: string }>();
  const isPending = fetcher.state !== "idle";
  const isSuccess = fetcher.state === "idle" && fetcher.data?.ok === true;
  const isError = fetcher.state === "idle" && fetcher.data?.error !== undefined;

  useFeedbackToast(
    { isSuccess, isError },
    {
      successMessage: "Activity logged successfully!",
      errorMessage: "Failed to log activity",
      onSuccess: () => closeRef.current?.click(),
    }
  );

  const initialDate = lastActivity
    ? addDays(lastActivity.date, 1)
    : new Date();

  const form = useForm({
    defaultValues: {
      date: initialDate,
      category: emptyCategory,
      intensity: "",
      timeSpent: "",
      description: "",
    } as DetailedActivityFormValues,
    onSubmit: ({ value }) => {
      const record: ActivityRecordServer = {
        date: format(value.date, "yyyy-MM-dd"),
        name: value.category.name,
        categoryId: value.category.categoryId,
      };
      if (value.intensity) record.intensity = value.intensity as Intensity;
      if (value.timeSpent) record.timeSpent = Number(value.timeSpent);
      if (value.description.trim())
        record.description = value.description.trim();

      fetcher.submit(
        {
          intent: "add",
          activities: JSON.stringify([record]),
        },
        { method: "post", action: "/welcome" }
      );
    },
  });

  return (
    <Dialog
      onOpenChange={(isOpen) => {
        if (isOpen) {
          form.reset();
          form.setFieldValue(
            "date",
            lastActivity ? addDays(lastActivity.date, 1) : new Date()
          );
        }
      }}
    >
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Plus className="size-4 mr-2" />
          Add with Details
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Log Activity with Details</DialogTitle>
          <DialogDescription>
            Add more information about your activity
          </DialogDescription>
        </DialogHeader>
        <form
          className="space-y-4 py-4"
          onSubmit={(e) => {
            e.preventDefault();
            form.handleSubmit();
          }}
        >
          <form.Field name="date" validators={{ onChange: dateSchema }}>
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
            validators={{ onChange: categoryOptionSchema }}
          >
            {(field) => (
              <CategoryAutocomplete
                value={field.state.value}
                onChange={field.handleChange}
                onBlur={field.handleBlur}
                error={getErrorMessage(field.state.meta.errors)}
                label="Activity Name"
              />
            )}
          </form.Field>
          <form.Field name="intensity">
            {(field) => (
              <div className="space-y-2">
                <Label htmlFor="details-intensity">Intensity</Label>
                <Select
                  value={field.state.value}
                  onValueChange={(v) => field.handleChange(v as "" | "low" | "medium" | "high")}
                >
                  <SelectTrigger id="details-intensity">
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
                <Label htmlFor="details-time">Time Spent</Label>
                <Input
                  id="details-time"
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
                <Label htmlFor="details-description">Description</Label>
                <Textarea
                  id="details-description"
                  placeholder="Add notes about your activity..."
                  rows={3}
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  onBlur={field.handleBlur}
                />
              </div>
            )}
          </form.Field>
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline" ref={closeRef}>
                Cancel
              </Button>
            </DialogClose>
            <form.Subscribe
              selector={(state) => [state.canSubmit, state.isDirty]}
            >
              {([canSubmit, isDirty]) => (
                <Button
                  type="submit"
                  disabled={isPending || !canSubmit || !isDirty}
                >
                  {isPending ? "Logging..." : "Log Activity"}
                </Button>
              )}
            </form.Subscribe>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
