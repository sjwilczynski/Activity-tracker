import * as React from "react";
import { Formik, Field, Form } from "formik";
import * as yup from "yup";
import { DatePickerField } from "./DatePickerField";
import { ActivityRecord, GetIdToken } from "../../data/types";
import axios from "axios";
import { useMutation } from "react-query";
import { useAuthContext } from "../Auth/AuthContext";

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

  const { getIdToken } = useAuthContext();
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
            await mutate({ ...values, getIdToken });
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

const addActivity = async (values: Variables) => {
  const activityRecord: ActivityRecord = {
    date: values.date.toLocaleDateString("en-CA"),
    activity: {
      name: values.name,
      active: values.active,
    },
  };
  if (!values.getIdToken) {
    throw new Error("No function to fetch the token");
  } else {
    const idToken = await values.getIdToken();
    const response = await axios.post("/api/activities", activityRecord, {
      headers: { Authorization: `Bearer ${idToken}` },
    });
    return response;
  }
};

type Variables = FormValues & { getIdToken: GetIdToken };
