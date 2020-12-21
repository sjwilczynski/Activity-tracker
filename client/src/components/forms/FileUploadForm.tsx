import { useCallback } from "react";
import { Formik, Form, Field, FormikErrors, FormikHelpers } from "formik";
import { areActivitiesValid, useActivitiesMutation } from "../../data";
import { Button, makeStyles } from "@material-ui/core";
import { FileInput } from "./FileInput";
import { FeedbackAlertGroup } from "../states/FeedbackAlertGroup";

const FILE_SIZE = 100 * 1024;
const SUPPORTED_FORMATS = ["application/json"];

type FormValues = {
  file: File | null;
};

const useStyles = makeStyles((theme) => ({
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
}));

export function FileUploadForm() {
  const { mutate: addActivities, isError, isSuccess } = useActivitiesMutation();
  const onSubmit = useCallback(
    (values: FormValues, formikHelpers: FormikHelpers<FormValues>) => {
      let reader = new FileReader();
      const { file } = values;
      if (file) {
        reader.onloadend = () => {
          const { result } = reader;
          if (typeof result === "string") {
            const activities = JSON.parse(result);
            if (areActivitiesValid(activities)) {
              addActivities(activities);
            } else {
              formikHelpers.setErrors({
                file:
                  "The specified json doesn't contain activities in proper format",
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
      <FeedbackAlertGroup
        isRequestError={isError}
        isRequestSuccess={isSuccess}
        successMessage="Successfully uploaded the fie"
        errorMessage="Failed to upload the file"
      />
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
