import { DatePicker as MuiDatePicker } from "@mui/x-date-pickers";
import { TextField, type TextFieldProps } from "@mui/material";
import { format, isValid } from "date-fns";

type DatePickerProps = {
  value: Date;
  onChange: (value: Date) => void;
  onBlur: () => void;
  error?: string;
  label: string;
  style?: TextFieldProps["sx"];
  size?: "small" | "medium";
};

export const DatePicker = ({
  value,
  onChange,
  onBlur,
  error,
  label,
  style,
  size,
}: DatePickerProps) => {
  const dayOfWeek = value && isValid(value) ? format(value, "EEE") : "";

  return (
    <MuiDatePicker
      label={label}
      value={value}
      onChange={(date) => {
        if (date) {
          onChange(date);
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
          onBlur={onBlur}
        />
      )}
    />
  );
};

type NullableDatePickerProps = {
  value: Date | null;
  onChange: (value: Date | null) => void;
  onBlur: () => void;
  error?: string;
  label: string;
  style?: TextFieldProps["sx"];
  size?: "small" | "medium";
};

export const NullableDatePicker = ({
  value,
  onChange,
  onBlur,
  error,
  label,
  style,
  size,
}: NullableDatePickerProps) => {
  const dayOfWeek = value && isValid(value) ? format(value, "EEE") : "";

  return (
    <MuiDatePicker
      label={label}
      value={value}
      onChange={(date) => {
        onChange(date);
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
          onBlur={onBlur}
        />
      )}
    />
  );
};
