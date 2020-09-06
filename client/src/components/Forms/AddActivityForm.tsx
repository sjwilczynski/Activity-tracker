import * as React from "react";
import { Formik, Field, Form } from "formik";
import * as yup from "yup";
import { DatePickerField } from "./DatePickerField";
import { ActivityRecord } from "../../data/types";
import axios from "axios";
import { useMutation } from "react-query";

type FormValues = {
  date: Date;
  name: string;
  active: boolean;
};

export function AddActivityForm() {
  const schema = yup.object({
    date: yup.date().required(),
    name: yup.string().required(),
    active: yup.bool().required(),
  });

  const [mutate] = useMutation(addActivity);

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
          try {
            await mutate(values);
          } catch (error) {
            console.log("Unexpected error on adding activity")
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

const addActivity = async (values: FormValues) => {
  const activityRecord: ActivityRecord = {
    date: values.date.toLocaleDateString("en-CA"),
    activity: {
      name: values.name,
      active: values.active,
    },
  };
  const response = await axios.post("/api/activities", activityRecord);
  return response;
};
