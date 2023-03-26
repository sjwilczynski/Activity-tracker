import { format } from "date-fns";
import { useCallback } from "react";
import {
  useEditActivityMutation,
  type ActivityRecordServer,
} from "../../../data";
import type { FormValues } from "../../forms";

export const useEditActivityFormSubmit = (id: string) => {
  const {
    mutate: editActivity,
    isError,
    isSuccess,
    isLoading,
  } = useEditActivityMutation();
  const onSubmit = useCallback(
    (values: FormValues) => {
      const activityRecord: ActivityRecordServer = {
        date: format(values.date, "yyyy-MM-dd"),
        name: values.category.name,
        active: values.category.active,
      };
      editActivity({ id, record: activityRecord });
    },
    [editActivity]
  );
  return { onSubmit, isError, isSuccess, isLoading };
};
