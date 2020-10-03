import * as React from "react";
import { Formik, Form, FormikErrors } from "formik";
import { DateInput } from "./Input";

type Props = {
  startDate: Date | undefined;
  endDate: Date | undefined;
  setDateRange: (
    startDate: Date | undefined,
    endDate: Date | undefined
  ) => void;
};

type FormValues = {
  startDate: string | undefined;
  endDate: string | undefined;
};

export const DateFilterForm = (props: Props) => {
  const { startDate, endDate, setDateRange } = props;
  const onSubmit = (values: FormValues) => {
    if (values.startDate && values.endDate) {
      setDateRange(new Date(values.startDate), new Date(values.endDate));
    }
  };
  return (
    <>
      <Formik
        initialValues={{
          startDate: startDate?.toLocaleDateString("en-CA") || "",
          endDate: endDate?.toLocaleDateString("en-CA") || "",
        }}
        onSubmit={onSubmit}
        validate={(values: FormValues) => {
          const errors: FormikErrors<FormValues> = {};
          if (!values.startDate) {
            errors.startDate = "Start date not set";
          }
          if (!values.endDate) {
            errors.endDate = "End date not set";
          }
          return errors;
        }}
      >
        {({ resetForm }) => (
          <Form>
            <DateInput name="startDate" label="Start date" />
            <DateInput name="endDate" label="End date" />
            <button type="submit">Set date range</button>
            <button
              type="button"
              onClick={() => {
                setDateRange(undefined, undefined);
                resetForm({
                  values: {
                    startDate: "",
                    endDate: "",
                  },
                });
              }}
            >
              Stop filtering
            </button>
          </Form>
        )}
      </Formik>
    </>
  );
};
