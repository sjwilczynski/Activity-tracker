import { Formik, Form, Field, FormikErrors } from "formik";
import { KeyboardDatePicker } from "formik-material-ui-pickers";
import { makeStyles } from "@material-ui/core";
import { isBefore } from "date-fns";
import { FormButtons } from "./FormButtons";
import {
  endDateFieldKey,
  FormValues,
  startDateFieldKey,
  useDateRangeState,
} from "./shared";

const useStyles = makeStyles((theme) => ({
  form: {
    display: "flex",
    alignItems: "center",
    flexFlow: "row wrap",
    padding: `${theme.spacing(1)}px`,
    "& > *": {
      margin: `${theme.spacing(1)}px ${theme.spacing(2)}px ${theme.spacing(
        1
      )}px 0`,
    },
    margin: `${theme.spacing(1)}px 0`,
  },
}));

export const DateFilterForm = () => {
  const [{ startDate, endDate }, setDateRange] = useDateRangeState();

  const onSubmit = (values: FormValues) => {
    if (values.startDate && values.endDate) {
      setDateRange({ startDate: values.startDate, endDate: values.endDate });
    }
  };
  const styles = useStyles();
  return (
    <>
      <Formik<FormValues>
        initialValues={{
          startDate,
          endDate,
        }}
        onSubmit={onSubmit}
        validate={validate}
      >
        <Form className={styles.form}>
          <Field
            component={KeyboardDatePicker}
            name={startDateFieldKey}
            label="Start date"
            format="yyyy-MM-dd"
            disabled={false}
            autoOk
          />
          <Field
            component={KeyboardDatePicker}
            name={endDateFieldKey}
            label="End date"
            format="yyyy-MM-dd"
            disabled={false}
            autoOk
          />
          <FormButtons />
        </Form>
      </Formik>
    </>
  );
};

const validate = (values: FormValues) => {
  const errors: FormikErrors<FormValues> = {};
  const { startDate, endDate } = values;
  if (!startDate) {
    errors.startDate = "Start date is required";
  }
  if (!endDate) {
    errors.endDate = "End date is required";
  }
  if (startDate && endDate && isBefore(endDate, startDate)) {
    errors.startDate = "Start date is after end date";
    errors.endDate = "End date is before start date";
  }
  return errors;
};
