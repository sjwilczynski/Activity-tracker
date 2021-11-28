import { Formik, Form, Field, FormikErrors } from "formik";
import { DatePicker } from "formik-mui-lab";
import makeStyles from "@mui/styles/makeStyles";
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
    padding: theme.spacing(1),
    "& > *": {
      margin: `${theme.spacing(1)} ${theme.spacing(2)} ${theme.spacing(1)} 0`,
    },
    margin: `${theme.spacing(1)} 0`,
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
            component={DatePicker}
            name={startDateFieldKey}
            label="Start date"
            inputFormat="yyyy-MM-dd"
            mask="____-__-__"
            textField={{ variant: "standard" }}
          />
          <Field
            component={DatePicker}
            name={endDateFieldKey}
            label="End date"
            inputFormat="yyyy-MM-dd"
            mask="____-__-__"
            textField={{ variant: "standard" }}
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
