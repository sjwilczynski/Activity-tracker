import { useForm } from "@tanstack/react-form";
import { isBefore } from "date-fns";
import { FormButtons } from "./FormButtons";
import type { FormValues } from "./shared";
import { useDateRangeState } from "./shared";
import { styled } from "@mui/material";
import { TanstackNullableDatePicker } from "../adapters";

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

export const DateFilterForm = () => {
  const [{ startDate, endDate }, setDateRange] = useDateRangeState();

  const form = useForm({
    defaultValues: {
      startDate,
      endDate,
    } as FormValues,
    validators: {
      onSubmit: ({ value }) => {
        const { startDate, endDate } = value;
        if (!startDate) {
          return "Start date is required";
        }
        if (!endDate) {
          return "End date is required";
        }
        if (startDate && endDate && isBefore(endDate, startDate)) {
          return "Start date must be before end date";
        }
        return undefined;
      },
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
      <form.Field name="startDate">
        {(field) => (
          <TanstackNullableDatePicker field={field} label="Start date" />
        )}
      </form.Field>
      <form.Field name="endDate">
        {(field) => (
          <TanstackNullableDatePicker field={field} label="End date" />
        )}
      </form.Field>
      <FormButtons form={form} />
    </StyledForm>
  );
};
