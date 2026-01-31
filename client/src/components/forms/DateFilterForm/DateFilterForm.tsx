import { Alert, styled } from "@mui/material";
import { useForm } from "@tanstack/react-form";
import {
  NullableDatePicker,
  getErrorMessage,
  getFormErrorMessage,
} from "../adapters";
import { dateFilterSchema } from "../schemas";
import { FormButtons } from "./FormButtons";
import { useDateRangeState } from "./shared";

const StyledForm = styled("form")(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  flexFlow: "row wrap",
  padding: theme.spacing(1),
  "& > div, & > button": {
    margin: `${theme.spacing(1)} ${theme.spacing(2)} ${theme.spacing(1)} 0`,
  },
  margin: `${theme.spacing(1)} 0`,
}));

const FormErrorAlert = styled(Alert)(({ theme }) => ({
  width: "100%",
  marginBottom: theme.spacing(1),
}));

export const DateFilterForm = () => {
  const [{ startDate, endDate }, setDateRange] = useDateRangeState();

  const form = useForm({
    defaultValues: {
      startDate,
      endDate,
    },
    validators: {
      onSubmit: dateFilterSchema,
    },
    onSubmit: ({ value }) => {
      if (value.startDate && value.endDate) {
        setDateRange({ startDate: value.startDate, endDate: value.endDate });
      }
    },
  });

  return (
    <StyledForm
      onSubmit={(e) => {
        e.preventDefault();
        e.stopPropagation();
        form.handleSubmit();
      }}
    >
      <form.Subscribe selector={(state) => state.errorMap.onSubmit}>
        {(error) =>
          error ? (
            <FormErrorAlert severity="error">
              {getFormErrorMessage(error)}
            </FormErrorAlert>
          ) : null
        }
      </form.Subscribe>
      <form.Field name="startDate">
        {(field) => (
          <NullableDatePicker
            value={field.state.value}
            onChange={field.handleChange}
            onBlur={field.handleBlur}
            error={getErrorMessage(field.state.meta.errors)}
            label="Start date"
          />
        )}
      </form.Field>
      <form.Field name="endDate">
        {(field) => (
          <NullableDatePicker
            value={field.state.value}
            onChange={field.handleChange}
            onBlur={field.handleBlur}
            error={getErrorMessage(field.state.meta.errors)}
            label="End date"
          />
        )}
      </form.Field>
      <FormButtons form={form} />
    </StyledForm>
  );
};
