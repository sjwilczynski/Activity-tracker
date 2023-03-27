import { Button, CircularProgress, TableCell, TableRow } from "@mui/material";
import CancelIcon from "@mui/icons-material/Cancel";
import SaveIcon from "@mui/icons-material/Save";
import type { ActivityRecordWithId } from "../../../data";
import { useAvailableCategories } from "../../../data";
import {
  CategoriesAutocomplete,
  DatePickerField,
  FormWrapper,
} from "../../forms";
import { Field } from "formik";
import { useEditActivityFormSubmit } from "./useEditActivityFormSubmit";
import { useEffect, useRef } from "react";
import styled from "@emotion/styled";
import { FeedbackAlertGroup } from "../../states/FeedbackAlertGroup";

type Props = {
  record: ActivityRecordWithId;
  onCancel: () => void;
};

export const RowInEditMode = ({ record, onCancel }: Props) => {
  const { onSubmit, isSuccess, isError, isLoading } = useEditActivityFormSubmit(
    record.id
  );
  const { availableCategories } = useAvailableCategories();
  useCancelOnSuccess(isSuccess, onCancel);
  return (
    <>
      <TableRow>
        <FormWrapper
          onSubmit={onSubmit}
          initialValues={{
            date: record.date,
            category: {
              name: record.name,
              categoryName:
                availableCategories.find(
                  (category) => category.name === record.name
                )?.categoryName ?? "",
              active: record.active,
            },
          }}
        >
          {({ isValid, dirty, handleBlur, setFieldValue, values }) => (
            <>
              <TableCell>
                <DatePickerField name="date" label="Date" />
              </TableCell>
              <TableCell>
                <CategoriesAutocomplete
                  name="category"
                  label="Activity name"
                  setFieldValue={setFieldValue}
                  handleBlur={handleBlur}
                />
                <Field name="active" type="checkbox" hidden />
              </TableCell>
              <TableCell>
                <Actions>
                  <Button
                    disabled={!isValid || !dirty || isLoading}
                    onClick={() => onSubmit(values)}
                    startIcon={<SaveIcon />}
                  >
                    Save
                  </Button>
                  <Button
                    startIcon={<CancelIcon />}
                    onClick={onCancel}
                    disabled={isLoading}
                  >
                    Cancel
                  </Button>
                  {isLoading && <CircularProgress size={20} />}
                </Actions>
              </TableCell>
            </>
          )}
        </FormWrapper>
      </TableRow>
      <FeedbackAlertGroup
        successMessage="Successfully edited activity"
        errorMessage="Failed to edit activity"
        isRequestError={isError}
        isRequestSuccess={isSuccess}
      />
    </>
  );
};

const useCancelOnSuccess = (isSuccess: boolean, onCancel: () => void) => {
  const successRef = useRef(isSuccess);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    if (isSuccess && !successRef.current) {
      // trigger onCancel after some time
      timeoutRef.current = setTimeout(onCancel, 1500);
      successRef.current = isSuccess;
    }
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [isSuccess, onCancel]);
};

const Actions = styled("div")({
  display: "flex",
  alignItems: "center",
  gap: 10,
});
