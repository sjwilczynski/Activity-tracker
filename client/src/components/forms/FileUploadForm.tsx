import * as React from "react";
import {
  Formik,
  Form,
  Field,
  FormikErrors,
  FieldProps,
  FormikHelpers,
} from "formik";
import { areActivitiesValid, useActivitiesMutation } from "../../data";

const FILE_SIZE = 160 * 1024;
const SUPPORTED_FORMATS = ["application/json"];

type FormValues = {
  file: File | null;
};

export function FileUploadForm() {
  const [addActivities, { status }] = useActivitiesMutation();
  const onSubmit = React.useCallback(
    async (values: FormValues, formikHelpers: FormikHelpers<FormValues>) => {
      let reader = new FileReader();
      const { file } = values;
      if (file) {
        reader.onloadend = () => {
          const { result } = reader;
          if (typeof result === "string") {
            try {
              const activities = JSON.parse(result);
              if (areActivitiesValid(activities)) {
                addActivities(activities);
              }
            } catch (err) {
              formikHelpers.setErrors({
                file: `Failed to upload the file: ${err.message}`,
              });
            }
          }
        };
        reader.readAsText(file);
      }
    },
    [addActivities]
  );

  return (
    <>
      <Formik<FormValues>
        validate={validate}
        initialValues={{
          file: null,
        }}
        onSubmit={onSubmit}
      >
        <Form>
          <Field
            name="file"
            title="Select a file"
            component={CustomFileInput}
          />
          <div></div>
          <button type="submit">Upload file</button>
        </Form>
      </Formik>
      {status === "success" ? (
        <div>Successfully uploaded the data</div>
      ) : undefined}
    </>
  );
}

const validate = (values: FormValues) => {
  const errors: FormikErrors<FormValues> = {};
  const { file } = values;
  if (!file) {
    errors.file = "File is required";
  } else if (file.size > FILE_SIZE) {
    errors.file = "File too large";
  } else if (!SUPPORTED_FORMATS.includes(file.type)) {
    errors.file = "Unsupported format";
  }
  return errors;
};

const CustomFileInput = (props: FieldProps & { title: string }) => {
  const { field, title, form } = props;
  const { setFieldValue, errors } = form;
  const { name } = field;
  const onFileInputChange = React.useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const files = event.currentTarget.files;
      if (files) {
        setFieldValue(name, files[0]);
      }
    },
    [setFieldValue, name]
  );
  return (
    <>
      <input
        name={name}
        type="file"
        onChange={onFileInputChange}
        title={title}
      />
      <div>{errors[name]}</div>
    </>
  );
};
