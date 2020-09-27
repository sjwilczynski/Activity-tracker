import * as React from "react";
import { Formik, Form } from "formik";
import * as yup from "yup";
import { ActivityRecord } from "../../data/types";
import { useActivityMutation } from "../../data/hooks/useActivityMutation";
import { Input } from "./Input";

export function AddActivityForm() {
  const schema = yup.object({
    date: yup.string().required(),
    name: yup.string().required(),
    active: yup.bool().required(),
  });

  const [addActivity] = useActivityMutation();

  return (
    <div>
      <Formik
        validationSchema={schema}
        initialValues={{
          date: "",
          name: "",
          active: true,
        }}
        onSubmit={async (values) => {
          const activityRecord: ActivityRecord = {
            date: values.date,
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
        <Form>
          <Input
            name="date"
            label="Date"
            placeholder="DD/MM/YYYY"
            type="date"
          />
          <Input
            name="name"
            label="Activity name"
            placeholder="name of the activity"
            type="text"
          />
          <Input name="active" label="Active" type="checkbox" />
          <button type="submit">Add activity</button>
        </Form>
      </Formik>
    </div>
  );
}
