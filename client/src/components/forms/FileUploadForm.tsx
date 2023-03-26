import { useCallback } from "react";
import type { FormikErrors, FormikHelpers } from "formik";
import { Formik, Form, Field } from "formik";
import { areActivitiesValid, useActivitiesMutation } from "../../data";
import { Button, styled } from "@mui/material";
import { FileInput } from "./FileInput";
import { FeedbackAlertGroup } from "../states/FeedbackAlertGroup";

const FILE_SIZE = 100 * 1024;
const SUPPORTED_FORMATS = ["application/json"];

type FormValues = {
  file: File | null;
};

const StyledForm = styled(Form)(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  alignItems: "stretch",
  padding: `${theme.spacing(1)} 0`,
}));

const ButtonSubmit = styled(Button)(({ theme }) => ({
  margin: `${theme.spacing(1)} 0`,
}));

export function FileUploadForm() {
  const { mutate: addActivities, isError, isSuccess } = useActivitiesMutation();
  const onSubmit = useCallback(
    (values: FormValues, formikHelpers: FormikHelpers<FormValues>) => {
      const reader = new FileReader();
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
                file: "The specified json doesn't contain activities in proper format",
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
          <StyledForm>
            <Field name="file" component={FileInput} />
            <ButtonSubmit
              disabled={!isValid || !dirty}
              variant="contained"
              color="primary"
              type="submit"
            >
              Upload
            </ButtonSubmit>
          </StyledForm>
        )}
      </Formik>
      <FeedbackAlertGroup
        isRequestError={isError}
        isRequestSuccess={isSuccess}
        successMessage="Successfully uploaded the file"
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
