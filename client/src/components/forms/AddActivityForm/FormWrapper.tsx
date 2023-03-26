import type { FormikProps } from "formik";
import { Formik } from "formik";
import type { ReactNode } from "react";
import * as yup from "yup";
import { FeedbackAlertGroup } from "../../states/FeedbackAlertGroup";
import { useAddActivityFormSubmit } from "./useAddActivityFormSubmit";

export type FormValues = {
  date: Date;
  name: string;
  active: boolean;
};

type Props = {
  children: (props: FormikProps<FormValues>) => ReactNode;
  successMessage: string;
  errorMessage: string;
  initialValues?: FormValues;
};

export const FormWrapper = ({
  children,
  successMessage,
  errorMessage,
  initialValues,
}: Props) => {
  const { onSubmit, isSuccess, isError } = useAddActivityFormSubmit();
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
      <FeedbackAlertGroup
        isRequestError={isError}
        isRequestSuccess={isSuccess}
        successMessage={successMessage}
        errorMessage={errorMessage}
      />
    </>
  );
};
