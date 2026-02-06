import type { TextFieldProps } from "@mui/material";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { DatePicker as MuiDatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { format, isValid } from "date-fns";

type BaseDatePickerProps = {
  value: Date | null;
  onChange: (value: Date | null) => void;
  onBlur: () => void;
  error?: string;
  label: string;
  style?: TextFieldProps["sx"];
  size?: "small" | "medium";
  showDayOfWeek?: boolean;
};

const BaseDatePicker = ({
  value,
  onChange,
  onBlur,
  error,
  label,
  style,
  size,
  showDayOfWeek,
}: BaseDatePickerProps) => {
  const dayOfWeek =
    showDayOfWeek && value && isValid(value) ? format(value, "EEE") : "";

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <MuiDatePicker
        label={label}
        value={value}
        onChange={onChange}
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
    </LocalizationProvider>
  );
};

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
  onChange,
  showDayOfWeek = true,
  ...rest
}: DatePickerProps) => (
  <BaseDatePicker
    {...rest}
    showDayOfWeek={showDayOfWeek}
    onChange={(date) => {
      if (date) {
        onChange(date);
      }
    }}
  />
);

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
  showDayOfWeek = false,
  ...rest
}: NullableDatePickerProps) => (
  <BaseDatePicker {...rest} showDayOfWeek={showDayOfWeek} />
);
