import * as React from "react";
import { useField, useFormikContext } from "formik";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

type DatePickerFieldProps = {
  name: string;
};

export const DatePickerField = (props: DatePickerFieldProps) => {
  const { setFieldValue } = useFormikContext();
  const [field] = useField<string>(props);
  return (
    <DatePicker
      {...field}
      selected={(field.value && new Date(field.value)) || null}
      onChange={(date) => {
        setFieldValue(field.name, date);
      }}
    />
  );
};
