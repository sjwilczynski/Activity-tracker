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
