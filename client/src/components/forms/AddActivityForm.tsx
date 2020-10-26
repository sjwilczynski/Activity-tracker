import * as React from "react";
import { Field, Formik, Form } from "formik";
import * as yup from "yup";
import { ActivityRecordServer, useActivitiesMutation } from "../../data";
import { KeyboardDatePicker } from "formik-material-ui-pickers";
import { CheckboxWithLabel, TextField } from "formik-material-ui";
import { Button, makeStyles } from "@material-ui/core";
import { format } from "date-fns";

type FormValues = {
  date: Date;
  name: string;
  active: boolean;
};

const useStyles = makeStyles((theme) => {
  return {
    form: {
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
    },
    field: {
      padding: `${theme.spacing(1)}px 0`,
    },
    submit: {
      width: "50%",
      alignSelf: "center",
    },
  };
});

export function AddActivityForm() {
  const [addActivities, { status }] = useActivitiesMutation();
  const onSubmit = React.useCallback(
    async (values: FormValues) => {
      const activityRecord: ActivityRecordServer = {
        date: format(values.date, "yyyy-MM-dd"),
        name: values.name,
        active: values.active,
      };
      try {
        await addActivities([activityRecord]);
      } catch (error) {
        // TODO: better error handling
        console.log("Unexpected error on adding activity");
      }
    },
    [addActivities]
  );

  const styles = useStyles();

  return (
    <>
      <Formik<FormValues>
        validationSchema={yup.object({
          date: yup.date().required(),
          name: yup.string().required(),
          active: yup.bool().required(),
        })}
        initialValues={{
          date: new Date(Date.now()),
          name: "",
          active: true,
        }}
        onSubmit={onSubmit}
      >
        {({ isValid, dirty }) => (
          <Form className={styles.form}>
            <Field
              component={KeyboardDatePicker}
              name="date"
              label="Date"
              format="yyyy-MM-dd"
              className={styles.field}
            />
            <Field
              component={TextField}
              name="name"
              label="Activity name"
              placeholder="name of the activity"
              type="text"
              className={styles.field}
            />
            <Field
              component={CheckboxWithLabel}
              name="active"
              Label={{ label: "Active" }}
              type="checkbox"
              color="primary"
            />
            <Button
              disabled={!isValid || !dirty}
              variant="contained"
              color="primary"
              type="submit"
              className={styles.submit}
            >
              Add activity
            </Button>
          </Form>
        )}
      </Formik>
      {status === "success" ? (
        <div>Successfully uploaded the data</div>
      ) : undefined}
    </>
  );
}
