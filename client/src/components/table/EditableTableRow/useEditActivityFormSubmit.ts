import { format } from "date-fns";
import { useCallback } from "react";
import { useFetcher } from "react-router";
import type { ActivityRecordServer } from "../../../data";
import type { ActivityFormValues } from "../../forms/schemas";

export const useEditActivityFormSubmit = (id: string) => {
  const fetcher = useFetcher<{ ok?: boolean; error?: string }>();
  const isError = fetcher.state === "idle" && fetcher.data?.error !== undefined;
  const isSuccess = fetcher.state === "idle" && fetcher.data?.ok === true;
  const isPending = fetcher.state !== "idle";

  const onSubmit = useCallback(
    (values: ActivityFormValues) => {
      const activityRecord: ActivityRecordServer = {
        date: format(values.date, "yyyy-MM-dd"),
        name: values.category.name,
        active: values.category.active,
      };
      fetcher.submit(
        {
          intent: "edit",
          id,
          record: JSON.stringify(activityRecord),
        },
        { method: "post", action: "/activity-list" }
      );
    },
    [fetcher.submit, id]
  );

  return { onSubmit, isError, isSuccess, isPending };
};
