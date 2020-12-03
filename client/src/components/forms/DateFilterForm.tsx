import { Formik, Form, Field, FormikErrors } from "formik";
import { KeyboardDatePicker } from "formik-material-ui-pickers";
import { Button, makeStyles } from "@material-ui/core";
import { isBefore } from "date-fns";

type Props = {
  startDate: Date | null;
  endDate: Date | null;
  setDateRange: (startDate: Date | null, endDate: Date | null) => void;
};

type FormValues = {
  startDate: Date | null;
  endDate: Date | null;
};

const useStyles = makeStyles((theme) => {
  return {
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
  };
});

export const DateFilterForm = (props: Props) => {
  const { startDate, endDate, setDateRange } = props;
  const onSubmit = (values: FormValues) => {
    if (values.startDate && values.endDate) {
      setDateRange(values.startDate, values.endDate);
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
        {({ resetForm }) => (
          <Form className={styles.form}>
            <Field
              component={KeyboardDatePicker}
              name="startDate"
              label="Start date"
              format="yyyy-MM-dd"
              autoOk
            />
            <Field
              component={KeyboardDatePicker}
              name="endDate"
              label="End date"
              format="yyyy-MM-dd"
              autoOk
            />
            {(!startDate || !endDate) && (
              <Button variant="contained" color="primary" type="submit">
                Set date range
              </Button>
            )}
            {startDate && endDate && (
              <Button
                type="button"
                variant="contained"
                color="primary"
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
                Clear range
              </Button>
            )}
          </Form>
        )}
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
