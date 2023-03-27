import type { DatePickerProps } from "formik-mui-x-date-pickers";
import { Field } from "formik";
import { DatePicker } from "formik-mui-x-date-pickers";

type Props = {
  name: string;
  label: string;
  style?: NonNullable<DatePickerProps["textField"]>["sx"];
  size?: NonNullable<DatePickerProps["textField"]>["size"];
};

export const DatePickerField = (props: Props) => (
  <Field
    component={props.size === "small" ? SmallDatePicker : DatePicker}
    name={props.name}
    label={props.label}
    inputFormat="yyyy-MM-dd"
    mask="____-__-__"
    textField={{ variant: "standard", sx: props.style }}
  />
);

const SmallDatePicker = (props: DatePickerProps) => (
  <DatePicker {...props} size="small" />
);
