import { useForm } from "@tanstack/react-form";
import { useEffect, useRef } from "react";
import { useFetcher } from "react-router";
import { areActivitiesValid } from "../../data";
import { useFeedbackToast } from "../../hooks/useFeedbackToast";
import { Button } from "../ui/button";
import { FileInput, getErrorMessage } from "./adapters";
import { fileSchema } from "./schemas";

export function FileUploadForm() {
  const fetcher = useFetcher<{ ok?: boolean; error?: string }>();
  const isError = fetcher.state === "idle" && fetcher.data?.error !== undefined;
  const isSuccess = fetcher.state === "idle" && fetcher.data?.ok === true;

  const form = useForm({
    defaultValues: {
      file: null as File | null,
    },
    onSubmit: ({ value }) => {
      const file = value.file;
      if (!file) return;

      const reader = new FileReader();
      reader.onloadend = () => {
        const { result } = reader;
        if (typeof result === "string") {
          const activities = JSON.parse(result);
          if (areActivitiesValid(activities)) {
            fetcher.submit(
              {
                intent: "add",
                activities: JSON.stringify(activities),
              },
              { method: "post", action: "/welcome" }
            );
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
  });

  useFeedbackToast(
    { isSuccess, isError },
    {
      successMessage: "Successfully uploaded the file",
      errorMessage: "Failed to upload the file",
    }
  );

  const isPending = fetcher.state !== "idle";
  const prevIsSuccess = useRef(isSuccess);

  useEffect(() => {
    if (isPending) {
      prevIsSuccess.current = false;
    }
  }, [isPending]);

  useEffect(() => {
    if (isSuccess && !prevIsSuccess.current) {
      form.reset();
    }
    prevIsSuccess.current = isSuccess;
  }, [isSuccess, form]);

  return (
    <form
      className="flex flex-col gap-4 pt-2"
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
        {(field) => (
          <FileInput
            value={field.state.value}
            onChange={field.handleChange}
            onBlur={field.handleBlur}
            error={getErrorMessage(field.state.meta.errors)}
          />
        )}
      </form.Field>
      <form.Subscribe selector={(state) => [state.canSubmit, state.isDirty]}>
        {([canSubmit, isDirty]) => (
          <Button
            variant="gradient"
            disabled={!canSubmit || !isDirty}
            type="submit"
          >
            Upload
          </Button>
        )}
      </form.Subscribe>
    </form>
  );
}
