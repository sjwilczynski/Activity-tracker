import { useCallback } from "react";
import { useForm } from "@tanstack/react-form";
import { areActivitiesValid, useActivitiesMutation } from "../../data";
import { Button, styled } from "@mui/material";
import { TanstackFileInput } from "./adapters";
import { FeedbackAlertGroup } from "../states/FeedbackAlertGroup";
import { fileSchema } from "./schemas";

const StyledForm = styled("form")(({ theme }) => ({
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

  const form = useForm({
    defaultValues: {
      file: null as File | null,
    },
    onSubmit: ({ value }) => {
      handleSubmit(value.file);
    },
  });

  const handleSubmit = useCallback(
    (file: File | null) => {
      if (!file) return;

      const reader = new FileReader();
      reader.onloadend = () => {
        const { result } = reader;
        if (typeof result === "string") {
          const activities = JSON.parse(result);
          if (areActivitiesValid(activities)) {
            addActivities(activities);
            form.reset();
          } else {
            form.setFieldMeta("file", (meta) => ({
              ...meta,
              errors: [
                "The specified json doesn't contain activities in proper format",
              ],
            }));
          }
        }
      };
      reader.readAsText(file);
    },
    [addActivities, form]
  );

  return (
    <>
      <StyledForm
        onSubmit={(e) => {
          e.preventDefault();
          e.stopPropagation();
          form.handleSubmit();
        }}
      >
        <form.Field
          name="file"
          validators={{
            onChange: fileSchema,
          }}
        >
          {(field) => <TanstackFileInput field={field} />}
        </form.Field>
        <form.Subscribe selector={(state) => [state.canSubmit, state.isDirty]}>
          {([canSubmit, isDirty]) => (
            <ButtonSubmit
              disabled={!canSubmit || !isDirty}
              variant="contained"
              color="primary"
              type="submit"
            >
              Upload
            </ButtonSubmit>
          )}
        </form.Subscribe>
      </StyledForm>
      <FeedbackAlertGroup
        isRequestError={isError}
        isRequestSuccess={isSuccess}
        successMessage="Successfully uploaded the file"
        errorMessage="Failed to upload the file"
      />
    </>
  );
}
