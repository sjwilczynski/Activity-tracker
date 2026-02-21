import { format } from "date-fns";
import { useCallback } from "react";
import { useFetcher } from "react-router";
import type { ActivityRecordServer } from "../../../data";
import type { ActivityFormValues } from "../schemas";

export const useAddActivityFormSubmit = () => {
  const fetcher = useFetcher<{ ok?: boolean; error?: string }>();
  const isError = fetcher.state === "idle" && fetcher.data?.error !== undefined;
  const isSuccess = fetcher.state === "idle" && fetcher.data?.ok === true;
  const isPending = fetcher.state !== "idle";

  const onSubmit = useCallback(
    (values: ActivityFormValues) => {
      const activityRecord: ActivityRecordServer = {
        date: format(values.date, "yyyy-MM-dd"),
        name: values.category.name,
        categoryId: values.category.categoryId,
      };
      fetcher.submit(
        {
          intent: "add",
          activities: JSON.stringify([activityRecord]),
        },
        { method: "post", action: "/welcome" }
      );
    },
    [fetcher.submit]
  );

  return { onSubmit, isError, isSuccess, isPending };
};
