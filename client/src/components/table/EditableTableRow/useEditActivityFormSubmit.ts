import { format } from "date-fns";
import { useCallback } from "react";
import {
  useEditActivityMutation,
  type ActivityRecordServer,
} from "../../../data";
import type { ActivityFormValues } from "../../forms/schemas";

export const useEditActivityFormSubmit = (id: string) => {
  const {
    mutate: editActivity,
    isError,
    isSuccess,
    isPending,
  } = useEditActivityMutation();
  const onSubmit = useCallback(
    (values: ActivityFormValues) => {
      const activityRecord: ActivityRecordServer = {
        date: format(values.date, "yyyy-MM-dd"),
        name: values.category.name,
        active: values.category.active,
      };
      editActivity({ id, record: activityRecord });
    },
    [editActivity, id]
  );
  return { onSubmit, isError, isSuccess, isPending };
};
