import type { FieldApi } from "@tanstack/react-form";
import { DatePicker } from "@mui/x-date-pickers";
import { TextField, type TextFieldProps } from "@mui/material";
import { format, isValid } from "date-fns";

type TanstackDatePickerProps = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  field: FieldApi<any, any, Date, any>;
  label: string;
  style?: TextFieldProps["sx"];
  size?: "small" | "medium";
};

export const TanstackDatePicker = ({
  field,
  label,
  style,
  size,
}: TanstackDatePickerProps) => {
  const selectedDate = field.state.value;
  const dayOfWeek =
    selectedDate && isValid(selectedDate) ? format(selectedDate, "EEE") : "";

  const error = field.state.meta.errors?.[0];

  return (
    <DatePicker
      label={label}
      value={selectedDate}
      onChange={(date) => {
        if (date) {
          field.handleChange(date);
        }
      }}
      inputFormat="yyyy-MM-dd"
      mask="____-__-__"
      renderInput={(params) => (
        <TextField
          {...params}
          variant="standard"
          sx={style}
          size={size}
          helperText={error ?? dayOfWeek}
          error={!!error}
          onBlur={field.handleBlur}
        />
      )}
    />
  );
};

type TanstackNullableDatePickerProps = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  field: FieldApi<any, any, Date | null, any>;
  label: string;
  style?: TextFieldProps["sx"];
  size?: "small" | "medium";
};

export const TanstackNullableDatePicker = ({
  field,
  label,
  style,
  size,
}: TanstackNullableDatePickerProps) => {
  const selectedDate = field.state.value;
  const dayOfWeek =
    selectedDate && isValid(selectedDate) ? format(selectedDate, "EEE") : "";

  const error = field.state.meta.errors?.[0];

  return (
    <DatePicker
      label={label}
      value={selectedDate}
      onChange={(date) => {
        field.handleChange(date);
      }}
      inputFormat="yyyy-MM-dd"
      mask="____-__-__"
      renderInput={(params) => (
        <TextField
          {...params}
          variant="standard"
          sx={style}
          size={size}
          helperText={error ?? dayOfWeek}
          error={!!error}
          onBlur={field.handleBlur}
        />
      )}
    />
  );
};
