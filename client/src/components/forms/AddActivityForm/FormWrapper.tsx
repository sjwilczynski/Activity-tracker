import type { FormikProps } from "formik";
import { Formik } from "formik";
import type { ComponentProps, ReactNode } from "react";
import * as yup from "yup";
import { FeedbackAlertGroup } from "../../states/FeedbackAlertGroup";

export type FormValues = {
  date: Date;
  name: string;
  active: boolean;
};

type Props = {
  children: (props: FormikProps<FormValues>) => ReactNode;
  onSubmit: (values: FormValues) => void;
  initialValues?: FormValues;
} & ComponentProps<typeof FeedbackAlertGroup>;

export const FormWrapper = ({
  children,
  onSubmit,
  initialValues,
  ...rest
}: Props) => {
  return (
    <>
      <Formik<FormValues>
        validationSchema={yup.object({
          date: yup.date().required(),
          name: yup.string().required(),
          active: yup.bool().required(),
        })}
        initialValues={
          initialValues ?? {
            date: new Date(Date.now()),
            name: "",
            active: true,
          }
        }
        onSubmit={onSubmit}
      >
        {(renderProps) => children(renderProps)}
      </Formik>
      <FeedbackAlertGroup {...rest} />
    </>
  );
};
