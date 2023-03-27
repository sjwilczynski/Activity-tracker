import type { FormikProps } from "formik";
import { Formik } from "formik";
import type { ReactNode } from "react";
import * as yup from "yup";
import type { CategoryOption } from "../../../data";

export type FormValues = {
  date: Date;
  category: CategoryOption;
};

type Props = {
  children: (props: FormikProps<FormValues>) => ReactNode;
  onSubmit: (values: FormValues) => void;
  initialValues?: FormValues;
};

export const FormWrapper = ({ children, onSubmit, initialValues }: Props) => (
  <Formik<FormValues>
    validationSchema={yup.object({
      date: yup.date().required(),
      category: yup.object({
        name: yup.string().required(),
        categoryName: yup.string().required(),
        active: yup.bool().required(),
      }),
    })}
    initialValues={
      initialValues ?? {
        date: new Date(Date.now()),
        category: { name: "", active: false, categoryName: "" },
      }
    }
    onSubmit={onSubmit}
  >
    {(renderProps) => children(renderProps)}
  </Formik>
);
