import * as React from "react";
import { Formik, Form } from "formik";
import * as yup from "yup";
import { ActivityRecord } from "../../data/types";
import { useActivityMutation } from "../../data/hooks/useActivityMutation";
import { Input } from "./Input";

type FormValues = {
  date: string;
  name: string;
  active: boolean;
};

export function AddActivityForm() {
  const [addActivity] = useActivityMutation();
  const onSubmit = React.useCallback(
    async (values: FormValues) => {
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
    },
    [addActivity]
  );

  return (
    <div>
      <Formik
        validationSchema={yup.object({
          date: yup.string().required(),
          name: yup.string().required(),
          active: yup.bool().required(),
        })}
        initialValues={{
          date: new Date(Date.now()).toLocaleDateString("en-CA"),
          name: "",
          active: true,
        }}
        onSubmit={onSubmit}
      >
        <Form>
          <Input name="date" label="Date" type="date" />
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
