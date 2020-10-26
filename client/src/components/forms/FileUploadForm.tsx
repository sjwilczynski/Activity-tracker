import * as React from "react";
import { Formik, Form, Field, FormikErrors, FormikHelpers } from "formik";
import { areActivitiesValid, useActivitiesMutation } from "../../data";
import { Button, makeStyles } from "@material-ui/core";
import { FileInput } from "./FileInput";

const FILE_SIZE = 80 * 1024;
const SUPPORTED_FORMATS = ["application/json"];

type FormValues = {
  file: File | null;
};

const useStyles = makeStyles((theme) => {
  return {
    form: {
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
      alignItems: "center",
      padding: `${theme.spacing(1)}px 0`,
    },
    submit: {
      margin: `${theme.spacing(1)}px 0`,
    },
  };
});

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
              } else {
                formikHelpers.setErrors({
                  file:
                    "The specified json doesn't contain activities in proper format",
                });
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

  const styles = useStyles();

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
          <Form className={styles.form}>
            <Field name="file" component={FileInput} />
            <Button
              disabled={!isValid || !dirty}
              variant="contained"
              color="primary"
              type="submit"
              className={styles.submit}
            >
              Upload
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
