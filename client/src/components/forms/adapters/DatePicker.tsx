import type { TextFieldProps } from "@mui/material";
import { DatePicker as MuiDatePicker } from "@mui/x-date-pickers";
import { format, isValid } from "date-fns";

type DatePickerProps = {
  value: Date;
  onChange: (value: Date) => void;
  onBlur: () => void;
  error?: string;
  label: string;
  style?: TextFieldProps["sx"];
  size?: "small" | "medium";
  showDayOfWeek?: boolean;
};

export const DatePicker = ({
  value,
  onChange,
  onBlur,
  error,
  label,
  style,
  size,
  showDayOfWeek = true,
}: DatePickerProps) => {
  const dayOfWeek =
    showDayOfWeek && value && isValid(value) ? format(value, "EEE") : "";

  return (
    <MuiDatePicker
      label={label}
      value={value}
      onChange={(date) => {
        if (date) {
          onChange(date);
        }
      }}
      format="yyyy-MM-dd"
      slotProps={{
        textField: {
          variant: "standard",
          sx: style,
          size,
          helperText: error ?? dayOfWeek,
          error: !!error,
          onBlur,
        },
      }}
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
  showDayOfWeek?: boolean;
};

export const NullableDatePicker = ({
  value,
  onChange,
  onBlur,
  error,
  label,
  style,
  size,
  showDayOfWeek = false,
}: NullableDatePickerProps) => {
  const dayOfWeek =
    showDayOfWeek && value && isValid(value) ? format(value, "EEE") : "";

  return (
    <MuiDatePicker
      label={label}
      value={value}
      onChange={(date) => {
        onChange(date);
      }}
      format="yyyy-MM-dd"
      slotProps={{
        textField: {
          variant: "standard",
          sx: style,
          size,
          helperText: error ?? dayOfWeek,
          error: !!error,
          onBlur,
        },
      }}
    />
  );
};
