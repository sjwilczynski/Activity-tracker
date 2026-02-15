import { useForm } from "@tanstack/react-form";
import { addDays } from "date-fns";
import { useEffect, useRef, useState } from "react";
import { type ActivityRecordWithId, type CategoryOption } from "../../../data";
import { useFeedbackToast } from "../../../hooks/useFeedbackToast";
import { cn } from "../../../utils/cn";
import { useFunAnimations } from "../../styles/StylesProvider";
import { Button } from "../../ui/button";
import { CategoryAutocomplete, DatePicker, getErrorMessage } from "../adapters";
import { categoryOptionSchema, dateSchema } from "../schemas";
import { useAddActivityFormSubmit } from "./useAddActivityFormSubmit";

type Props = {
  lastActivity: ActivityRecordWithId | undefined;
};

const emptyCategory: CategoryOption = {
  name: "",
  active: false,
  categoryName: "",
};

function useFormResetOnSuccess(
  reset: () => void,
  setFieldValue: (field: "date", value: Date) => void,
  lastActivity: ActivityRecordWithId | undefined,
  { isSuccess, isPending }: { isSuccess: boolean; isPending: boolean }
) {
  const [submitCount, setSubmitCount] = useState(0);
  const prevIsSuccess = useRef(isSuccess);

  useEffect(() => {
    if (isPending) {
      prevIsSuccess.current = false;
    }
  }, [isPending]);

  useEffect(() => {
    if (isSuccess && !prevIsSuccess.current) {
      reset();
      const nextDate = lastActivity
        ? addDays(lastActivity.date, 1)
        : new Date();
      setFieldValue("date", nextDate);
      setSubmitCount((c) => c + 1);
    }
    prevIsSuccess.current = isSuccess;
  }, [isSuccess, lastActivity, reset, setFieldValue, setSubmitCount]);

  return submitCount;
}

export function AddActivityForm({ lastActivity }: Props) {
  const { onSubmit, isSuccess, isError, isPending } =
    useAddActivityFormSubmit();

  const [funAnimations] = useFunAnimations();
  const [isAnimating, setIsAnimating] = useState(false);

  useFeedbackToast(
    { isSuccess, isError },
    {
      successMessage: "Activity added successfully",
      errorMessage: "Failed to add activity",
    }
  );

  const prevIsSuccessForAnim = useRef(isSuccess);
  useEffect(() => {
    if (isPending) {
      prevIsSuccessForAnim.current = false;
    }
  }, [isPending]);
  useEffect(() => {
    if (isSuccess && !prevIsSuccessForAnim.current && funAnimations) {
      setIsAnimating(true);
      const timer = setTimeout(() => setIsAnimating(false), 600);
      return () => clearTimeout(timer);
    }
    prevIsSuccessForAnim.current = isSuccess;
  }, [isSuccess, funAnimations]);

  const initialDate = lastActivity ? addDays(lastActivity.date, 1) : new Date();

  const form = useForm({
    defaultValues: {
      date: initialDate,
      category: emptyCategory,
    },
    onSubmit: ({ value }) => {
      onSubmit(value);
    },
  });

  const submitCount = useFormResetOnSuccess(
    form.reset,
    form.setFieldValue,
    lastActivity,
    { isSuccess, isPending }
  );

  return (
    <form
      className="grid gap-4 sm:grid-cols-2"
      onSubmit={(e) => {
        e.preventDefault();
        e.stopPropagation();
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
            key={submitCount}
            value={field.state.value}
            onChange={field.handleChange}
            onBlur={field.handleBlur}
            error={getErrorMessage(field.state.meta.errors)}
            label="Activity name"
            autoFocus={submitCount > 0}
          />
        )}
      </form.Field>
      <div className="sm:col-span-2 sm:text-right">
        <form.Subscribe selector={(state) => [state.canSubmit, state.isDirty]}>
          {([canSubmit, isDirty]) => (
            <Button
              disabled={!canSubmit || !isDirty || isPending}
              variant="gradient"
              type="submit"
              className={cn(
                "w-full sm:w-auto px-8",
                isAnimating && "animate-success-burst"
              )}
            >
              {isPending ? "Logging..." : "Log Activity"}
            </Button>
          )}
        </form.Subscribe>
      </div>
    </form>
  );
}
