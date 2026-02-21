import { format } from "date-fns";
import { useCallback } from "react";
import { useFetcher } from "react-router";
import type { ActivityRecordServer } from "../../../data";
import type { ActivityFormValues } from "../schemas";

export const useAddActivityFormSubmit = () => {
  const { state, data, submit } = useFetcher<{ ok?: boolean; error?: string }>();
  const isError = state === "idle" && data?.error !== undefined;
  const isSuccess = state === "idle" && data?.ok === true;
  const isPending = state !== "idle";

  const onSubmit = useCallback(
    (values: ActivityFormValues) => {
      const activityRecord: ActivityRecordServer = {
        date: format(values.date, "yyyy-MM-dd"),
        name: values.category.name,
        categoryId: values.category.categoryId,
      };
      submit(
        {
          intent: "add",
          activities: JSON.stringify([activityRecord]),
        },
        { method: "post", action: "/welcome" }
      );
    },
    [submit]
  );

  return { onSubmit, isError, isSuccess, isPending };
};
