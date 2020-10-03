import React from "react";
import { useField } from "formik";

type Props = {
  label: string;
  name: string;
  placeholder?: string;
  type: string;
};

export const Input = ({ label, ...props }: Props) => {
  const [field, meta] = useField(props);
  return (
    <>
      <label htmlFor={props.name}>{label}</label>
      <input {...field} {...props} />
      {meta.touched && meta.error ? <div>{meta.error}</div> : null}
    </>
  );
};

export const DateInput = ({ label, ...props }: Omit<Props, "type">) => {
  const [field, meta] = useField({ ...props, type: "date" });
  const { value, ...fieldProps } = field;
  return (
    <>
      <label htmlFor={props.name}>{label}</label>
      <input
        {...fieldProps}
        {...props}
        value={
          value instanceof Date
            ? value.toLocaleDateString("en-CA")
            : value || ""
        }
        type="date"
      />
      {meta.touched && meta.error ? <div>{meta.error}</div> : null}
    </>
  );
};
