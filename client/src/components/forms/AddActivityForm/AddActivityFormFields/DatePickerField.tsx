import type { DatePickerProps } from "formik-mui-x-date-pickers";
import { Field } from "formik";
import { DatePicker } from "formik-mui-x-date-pickers";

type Props = {
  name: string;
  label: string;
  style: DatePickerProps["sx"];
};

export const DatePickerField = (props: Props) => (
  <Field
    component={DatePicker}
    name={props.name}
    label={props.label}
    inputFormat="yyyy-MM-dd"
    sx={props.style}
    mask="____-__-__"
    textField={{ variant: "standard" }}
  />
);
