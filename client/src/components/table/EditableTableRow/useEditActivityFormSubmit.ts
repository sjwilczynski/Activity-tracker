import { format } from "date-fns";
import { useCallback } from "react";
import { useFetcher } from "react-router";
import type { ActivityRecordServer, Intensity } from "../../../data";
import type { DetailedActivityFormValues } from "../../forms/schemas";

export const useEditActivityFormSubmit = (id: string) => {
  const { state, data, submit } = useFetcher<{ ok?: boolean; error?: string }>();
  const isError = state === "idle" && data?.error !== undefined;
  const isSuccess = state === "idle" && data?.ok === true;
  const isPending = state !== "idle";

  const onSubmit = useCallback(
    (values: DetailedActivityFormValues) => {
      const activityRecord: ActivityRecordServer = {
        date: format(values.date, "yyyy-MM-dd"),
        name: values.category.name,
        categoryId: values.category.categoryId,
      };
      if (values.intensity)
        activityRecord.intensity = values.intensity as Intensity;
      if (values.timeSpent)
        activityRecord.timeSpent = Number(values.timeSpent);
      if (values.description.trim())
        activityRecord.description = values.description.trim();
      submit(
        {
          intent: "edit",
          id,
          record: JSON.stringify(activityRecord),
        },
        { method: "post", action: "/activity-list" }
      );
    },
    [submit, id]
  );

  return { onSubmit, isError, isSuccess, isPending };
};
