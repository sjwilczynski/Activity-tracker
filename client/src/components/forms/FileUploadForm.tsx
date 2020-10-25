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
import { Button } from "@material-ui/core";

const FILE_SIZE = 80 * 1024;
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
        {({ isValid, dirty }) => (
          <Form>
            <Field name="file" component={CustomFileInput} />
            <Button disabled={!isValid || !dirty} type="submit">
              Upload file
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

const CustomFileInput = (props: FieldProps<File | null, FormValues>) => {
  const { field, form } = props;
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
        style={{ display: "none" }}
        id="contained-button-file"
        type="file"
        onChange={onFileInputChange}
      />
      <label htmlFor="contained-button-file">
        <Button variant="contained" component="span">
          Select a file
        </Button>
      </label>
      <div>{field.value?.name}</div>
      <div>{errors.file}</div>
    </>
  );
};
