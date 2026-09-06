import { useForm } from "@tanstack/react-form";
import { useEffect, useRef, useState } from "react";
import { validateImportData, type BackupData } from "../../../../shared/backup";
import { useRestoreBackup } from "../../data/mutations";
import { useFeedbackToast } from "../../hooks/useFeedbackToast";
import { Button } from "../ui/button";
import { FileInput, getErrorMessage } from "./adapters";
import { fileSchema } from "./schemas";

export function FileUploadForm() {
  const mutation = useRestoreBackup();
  const [isReading, setIsReading] = useState(false);
  const readerRef = useRef<FileReader | null>(null);
  const isPending = mutation.isPending || isReading;

  useEffect(
    () => () => {
      const reader = readerRef.current;
      if (!reader) return;
      reader.onload = null;
      reader.onerror = null;
      reader.onloadend = null;
      if (reader.readyState === FileReader.LOADING) reader.abort();
    },
    []
  );

  const form = useForm({
    defaultValues: { file: null as File | null },
    onSubmit: ({ value }) => {
      if (!value.file || isPending || readerRef.current) return;
      mutation.reset();
      const reader = new FileReader();
      readerRef.current = reader;
      setIsReading(true);
      const showFileError = (error: string) => {
        form.setFieldMeta("file", (meta) => ({ ...meta, errors: [error] }));
      };
      reader.onload = () => {
        if (typeof reader.result !== "string") {
          showFileError("Could not read the selected file.");
          return;
        }
        let data: unknown;
        try {
          data = JSON.parse(reader.result);
        } catch (error) {
          showFileError(
            `Invalid JSON: ${error instanceof Error ? error.message : "parse error"}`
          );
          return;
        }
        const result = validateImportData(data);
        if (!result.valid) {
          showFileError(
            "Invalid format. Expected JSON with activities, categories, and optional preferences."
          );
          return;
        }
        // Keep the validated wire payload intact; the API normalizes legacy backups.
        mutation.mutate(data as BackupData);
      };
      reader.onerror = () => showFileError("Could not read the selected file.");
      reader.onloadend = () => {
        readerRef.current = null;
        setIsReading(false);
      };
      reader.readAsText(value.file);
    },
  });

  useFeedbackToast(mutation, {
    successMessage: "Successfully uploaded the file",
    errorMessage: "Failed to upload the file",
    onSuccess: () => form.reset(),
  });

  return (
    <form
      className="flex flex-col gap-4 pt-2"
      onSubmit={(e) => {
        e.preventDefault();
        e.stopPropagation();
        void form.handleSubmit();
      }}
    >
      <fieldset disabled={isPending}>
        <form.Field name="file" validators={{ onChange: fileSchema }}>
          {(field) => (
            <FileInput
              value={field.state.value}
              onChange={field.handleChange}
              onBlur={field.handleBlur}
              error={getErrorMessage(field.state.meta.errors)}
            />
          )}
        </form.Field>
      </fieldset>
      <form.Subscribe selector={(state) => [state.canSubmit, state.isDirty]}>
        {([canSubmit, isDirty]) => (
          <Button
            variant="gradient"
            disabled={isPending || !canSubmit || !isDirty}
            type="submit"
          >
            {isPending ? "Uploading..." : "Upload"}
          </Button>
        )}
      </form.Subscribe>
    </form>
  );
}
