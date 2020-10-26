import * as React from "react";
import { Field, Formik, Form } from "formik";
import * as yup from "yup";
import { ActivityRecordServer, useActivitiesMutation } from "../../data";
import { KeyboardDatePicker } from "formik-material-ui-pickers";
import { CheckboxWithLabel, TextField } from "formik-material-ui";
import { Button } from "@material-ui/core";
import { format } from "date-fns";

type FormValues = {
  date: Date;
  name: string;
  active: boolean;
};

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
          <Form>
            <Field
              component={KeyboardDatePicker}
              name="date"
              label="Date"
              format="yyyy-MM-dd"
            />
            <Field
              component={TextField}
              name="name"
              label="Activity name"
              placeholder="name of the activity"
              type="text"
            />
            <Field
              component={CheckboxWithLabel}
              name="active"
              Label={{ label: "Active" }}
              type="checkbox"
            />
            <Button disabled={!isValid || !dirty} type="submit">
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
