import * as React from "react";
import { Formik, Form, Field } from "formik";
import { KeyboardDatePicker } from "formik-material-ui-pickers";
import { Button } from "@material-ui/core";
import * as yup from "yup";

type Props = {
  startDate: Date | null;
  endDate: Date | null;
  setDateRange: (startDate: Date | null, endDate: Date | null) => void;
};

type FormValues = {
  startDate: Date | null;
  endDate: Date | null;
};

export const DateFilterForm = (props: Props) => {
  const { startDate, endDate, setDateRange } = props;
  const onSubmit = (values: FormValues) => {
    if (values.startDate && values.endDate) {
      setDateRange(values.startDate, values.endDate);
    }
  };
  return (
    <>
      <Formik<FormValues>
        initialValues={{
          startDate,
          endDate,
        }}
        onSubmit={onSubmit}
        validationSchema={yup.object({
          startDate: yup.date().required(),
          endDate: yup.date().required(),
        })}
      >
        {({ resetForm, isValid, dirty }) => (
          <Form>
            <Field
              component={KeyboardDatePicker}
              name="startDate"
              label="Start date"
              format="yyyy-MM-dd"
            />
            <Field
              component={KeyboardDatePicker}
              name="endDate"
              label="End date"
              format="yyyy-MM-dd"
            />
            <Button disabled={!isValid || !dirty} type="submit">
              Set date range
            </Button>
            <Button
              type="button"
              onClick={() => {
                setDateRange(null, null);
                resetForm({
                  values: {
                    startDate: null,
                    endDate: null,
                  },
                });
              }}
            >
              Stop filtering
            </Button>
          </Form>
        )}
      </Formik>
    </>
  );
};
