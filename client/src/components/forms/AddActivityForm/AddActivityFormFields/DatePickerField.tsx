import type { DatePickerProps } from "formik-mui-x-date-pickers";
import { Field, useField } from "formik";
import { DatePicker } from "formik-mui-x-date-pickers";
import { format, isValid } from "date-fns";

type Props = {
  name: string;
  label: string;
  style?: NonNullable<DatePickerProps["textField"]>["sx"];
  size?: NonNullable<DatePickerProps["textField"]>["size"];
};

export const DatePickerField = (props: Props) => {
  const [field] = useField<Date>(props.name);
  const selectedDate = field.value;

  const dayOfWeek = selectedDate && isValid(selectedDate)
    ? format(selectedDate, "EEE")
    : "";

  return (
    <Field
      component={props.size === "small" ? SmallDatePicker : DatePicker}
      name={props.name}
      label={props.label}
      inputFormat="yyyy-MM-dd"
      mask="____-__-__"
      textField={{
        variant: "standard",
        sx: props.style,
        helperText: dayOfWeek
      }}
    />
  );
};

const SmallDatePicker = (props: DatePickerProps) => (
  <DatePicker {...props} size="small" />
);
