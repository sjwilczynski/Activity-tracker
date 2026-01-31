import { Button, CircularProgress, TableCell, TableRow } from "@mui/material";
import CancelIcon from "@mui/icons-material/Cancel";
import SaveIcon from "@mui/icons-material/Save";
import type { ActivityRecordWithId, CategoryOption } from "../../../data";
import { useAvailableCategories } from "../../../data";
import { TanstackDatePicker, TanstackAutocomplete } from "../../forms/adapters";
import { useEditActivityFormSubmit } from "./useEditActivityFormSubmit";
import { useEffect, useRef } from "react";
import styled from "@emotion/styled";
import { FeedbackAlertGroup } from "../../states/FeedbackAlertGroup";
import { useForm } from "@tanstack/react-form";
import {
  categoryOptionSchema,
  type ActivityFormValues,
} from "../../forms/schemas";
import { z } from "zod";

type Props = {
  record: ActivityRecordWithId;
  onCancel: () => void;
};

const hiddenLabelStyle = {
  "& > label": {
    display: "none",
  },
  "& > .MuiInput-root": {
    marginTop: 0,
  },
};

const dateSchema = z.date({ required_error: "Date is required" });

export const RowInEditMode = ({ record, onCancel }: Props) => {
  const { onSubmit, isSuccess, isError, isPending } = useEditActivityFormSubmit(
    record.id
  );
  const { availableCategories } = useAvailableCategories();
  useCancelOnSuccess(isSuccess, onCancel);

  const initialCategory: CategoryOption = {
    name: record.name,
    categoryName:
      availableCategories.find((category) => category.name === record.name)
        ?.categoryName ?? "",
    active: record.active,
  };

  const form = useForm({
    defaultValues: {
      date: record.date,
      category: initialCategory,
    } as ActivityFormValues,
    onSubmit: ({ value }) => {
      onSubmit(value);
    },
  });

  return (
    <>
      <TableRow>
        <TableCell>
          <form.Field
            name="date"
            validators={{
              onChange: dateSchema,
            }}
          >
            {(field) => (
              <TanstackDatePicker
                field={field}
                label="Date"
                style={hiddenLabelStyle}
                size="small"
              />
            )}
          </form.Field>
        </TableCell>
        <TableCell>
          <form.Field
            name="category"
            validators={{
              onChange: categoryOptionSchema,
            }}
          >
            {(field) => (
              <TanstackAutocomplete
                field={field}
                label="Activity name"
                style={hiddenLabelStyle}
                size="small"
              />
            )}
          </form.Field>
        </TableCell>
        <TableCell>
          <form.Subscribe
            selector={(state) => [state.canSubmit, state.isDirty]}
          >
            {([canSubmit, isDirty]) => (
              <Actions>
                <Button
                  disabled={!canSubmit || !isDirty || isPending}
                  onClick={() => form.handleSubmit()}
                  startIcon={<SaveIcon />}
                >
                  Save
                </Button>
                <Button
                  startIcon={<CancelIcon />}
                  onClick={onCancel}
                  disabled={isPending}
                >
                  Cancel
                </Button>
                {isPending && <CircularProgress size={20} />}
              </Actions>
            )}
          </form.Subscribe>
        </TableCell>
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
