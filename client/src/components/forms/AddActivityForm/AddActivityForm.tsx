import { Button, styled, type TextFieldProps } from "@mui/material";
import { useForm } from "@tanstack/react-form";
import { addDays } from "date-fns";
import { useState } from "react";
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

export function AddActivityForm({ lastActivity }: Props) {
  const { onSubmit, isSuccess, isError } = useAddActivityFormSubmit();
  const [submitCount, setSubmitCount] = useState(0);

  const initialDate = lastActivity ? addDays(lastActivity.date, 1) : new Date();

  const form = useForm({
    defaultValues: {
      date: initialDate,
      category: emptyCategory,
    },
    onSubmit: ({ value }) => {
      onSubmit(value);
      form.reset();
      form.setFieldValue("date", initialDate);
      form.setFieldValue("category", emptyCategory);
      setSubmitCount((c) => c + 1);
    },
  });

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
              disabled={!canSubmit || !isDirty}
              variant="contained"
              color="primary"
              type="submit"
            >
              Add activity
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
