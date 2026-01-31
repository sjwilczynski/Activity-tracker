import { useForm } from "@tanstack/react-form";
import { Button, styled, type TextFieldProps } from "@mui/material";
import { TanstackDatePicker, TanstackAutocomplete } from "../adapters";
import { useAddActivityFormSubmit } from "./useAddActivityFormSubmit";
import { FeedbackAlertGroup } from "../../states/FeedbackAlertGroup";
import { type ActivityRecordWithId, type CategoryOption } from "../../../data";
import { addDays } from "date-fns";
import { categoryOptionSchema, type ActivityFormValues } from "../schemas";
import { z } from "zod";

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

const dateSchema = z.date({ required_error: "Date is required" });

export function AddActivityForm({ lastActivity }: Props) {
  const { onSubmit, isSuccess, isError } = useAddActivityFormSubmit();

  const initialDate = lastActivity ? addDays(lastActivity.date, 1) : new Date();

  const form = useForm({
    defaultValues: {
      date: initialDate,
      category: emptyCategory,
    } as ActivityFormValues,
    onSubmit: ({ value }) => {
      onSubmit(value);
      form.reset();
      form.setFieldValue("date", initialDate);
      form.setFieldValue("category", emptyCategory);
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
            <TanstackDatePicker field={field} label="Date" style={fieldStyle} />
          )}
        </form.Field>
        <form.Field
          name="category"
          validators={{
            onChange: categoryOptionSchema,
          }}
        >
          {(field) => (
            <TanstackAutocomplete
              field={field}
              label="Activity name"
              style={fieldStyle}
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
