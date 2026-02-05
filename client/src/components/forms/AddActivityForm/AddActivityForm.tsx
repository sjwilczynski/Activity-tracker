import { Button, styled, type TextFieldProps } from "@mui/material";
import { useForm } from "@tanstack/react-form";
import { addDays } from "date-fns";
import { useEffect, useRef, useState } from "react";
import { type ActivityRecordWithId, type CategoryOption } from "../../../data";
import { FeedbackAlertGroup } from "../../states/FeedbackAlertGroup";
import { CategoryAutocomplete, DatePicker, getErrorMessage } from "../adapters";
import { categoryOptionSchema, dateSchema } from "../schemas";
import { useAddActivityFormSubmit } from "./useAddActivityFormSubmit";

const StyledForm = styled("form")(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  justifyContent: "center",
  padding: `${theme.spacing(1)} 0`,
}));

const fieldStyle: TextFieldProps["sx"] = {
  my: 1,
  mx: 0,
};

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
    <>
      <StyledForm
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
              style={fieldStyle}
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
              style={fieldStyle}
              autoFocus={submitCount > 0}
            />
          )}
        </form.Field>
        <form.Subscribe selector={(state) => [state.canSubmit, state.isDirty]}>
          {([canSubmit, isDirty]) => (
            <Button
              disabled={!canSubmit || !isDirty || isPending}
              variant="contained"
              color="primary"
              type="submit"
            >
              {isPending ? "Adding..." : "Add activity"}
            </Button>
          )}
        </form.Subscribe>
      </StyledForm>
      <FeedbackAlertGroup
        successMessage="Activity added successfully"
        errorMessage="Failed to add activity"
        isRequestError={isError}
        isRequestSuccess={isSuccess}
      />
    </>
  );
}
