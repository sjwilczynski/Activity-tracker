import * as React from "react";
import { Formik, Field, Form } from "formik";
import * as yup from "yup";
import { DatePickerField } from "./DatePickerField";
import { ActivityRecord } from "../../data/types";
import { useActivityMutation } from "../../data/hooks/useActivityMutation";

export function AddActivityForm() {
  const schema = yup.object({
    date: yup.date().required(),
    name: yup.string().required(),
    active: yup.bool().required(),
  });

  const [addActivity] = useActivityMutation();

  return (
    <div>
      <Formik
        validationSchema={schema}
        initialValues={{
          date: new Date(Date.now()),
          name: "",
          active: true,
        }}
        onSubmit={async (values) => {
          const activityRecord: ActivityRecord = {
            date: values.date.toLocaleDateString("en-CA"),
            activity: {
              name: values.name,
              active: values.active,
            },
          };
          try {
            await addActivity(activityRecord);
          } catch (error) {
            console.log("Unexpected error on adding activity");
          }
        }}
      >
        {({ touched, errors }) => (
          <Form>
            <DatePickerField name="date" />
            {touched.date && errors.date ? <div>{errors.date}</div> : <></>}
            <Field name="name" />
            {touched.name && errors.name ? <div>{errors.name}</div> : <></>}
            <Field name="active" />
            {touched.active && errors.active ? (
              <div>{errors.active}</div>
            ) : (
              <></>
            )}
            <button type="submit">Add activity</button>
          </Form>
        )}
      </Formik>
    </div>
  );
}
