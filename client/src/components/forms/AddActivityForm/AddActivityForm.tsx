import { Field, Form } from "formik";
import type { Theme } from "@mui/material";
import { Button, styled } from "@mui/material";
import type { SxProps } from "@mui/system";
import { DatePickerField } from "./AddActivityFormFields/DatePickerField";
import { CategoriesAutocomplete } from "./AddActivityFormFields/CategoriesAutocomplete";
import { FormWrapper } from "./FormWrapper";
import { useAddActivityFormSubmit } from "./useAddActivityFormSubmit";
import { FeedbackAlertGroup } from "../../states/FeedbackAlertGroup";
import { type ActivityRecordWithId } from "../../../data";
import { addDays } from "date-fns";

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

type Props = {
  lastActivity: ActivityRecordWithId | undefined;
};

export function AddActivityForm({ lastActivity }: Props) {
  const { onSubmit, isSuccess, isError } = useAddActivityFormSubmit();

  const initialDate = lastActivity ? addDays(lastActivity.date, 1) : new Date();

  return (
    <>
      <FormWrapper
        onSubmit={onSubmit}
        initialValues={{
          date: initialDate,
          category: { name: "", active: false, categoryName: "" },
        }}
      >
        {({ isValid, dirty, handleBlur }) => {
          return (
            <StyledForm>
              <DatePickerField name="date" label="Date" style={fieldStyle} />
              <CategoriesAutocomplete
                name="category"
                style={fieldStyle}
                label="Activity name"
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
