import { Field, Form } from "formik";
import type { Theme } from "@mui/material";
import { Button, styled } from "@mui/material";
import type { SxProps } from "@mui/system";
import { DatePickerField } from "./AddActivityFormFields/DatePickerField";
import { CategoriesAutocomplete } from "./AddActivityFormFields/CategoriesAutocomplete";
import { FormWrapper } from "./FormWrapper";
import { useAddActivityFormSubmit } from "./useAddActivityFormSubmit";
import { FeedbackAlertGroup } from "../../states/FeedbackAlertGroup";

const StyledForm = styled(Form)(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  justifyContent: "center",
  padding: `${theme.spacing(1)} 0`,
}));

const fieldStyle: SxProps<Theme> = {
  my: 1,
  mx: 0,
};

export function AddActivityForm() {
  const { onSubmit, isSuccess, isError } = useAddActivityFormSubmit();
  return (
    <>
      <FormWrapper onSubmit={onSubmit}>
        {({ isValid, dirty, handleBlur, setFieldValue, values }) => {
          console.log(values);
          return (
            <StyledForm>
              <DatePickerField name="date" label="Date" style={fieldStyle} />
              <CategoriesAutocomplete
                name="category"
                style={fieldStyle}
                label="Activity name"
                setFieldValue={setFieldValue}
                handleBlur={handleBlur}
              />
              <Field name="active" type="checkbox" hidden />
              <Button
                disabled={!isValid || !dirty}
                variant="contained"
                color="primary"
                type="submit"
              >
                Add activity
              </Button>
            </StyledForm>
          );
        }}
      </FormWrapper>
      <FeedbackAlertGroup
        successMessage="Activity added successfully"
        errorMessage="Failed to add activity"
        isRequestError={isError}
        isRequestSuccess={isSuccess}
      />
    </>
  );
}
