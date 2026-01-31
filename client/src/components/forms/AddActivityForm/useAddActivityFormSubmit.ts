import { format } from "date-fns";
import { useCallback } from "react";
import {
  useActivitiesMutation,
  type ActivityRecordServer,
} from "../../../data";
import type { ActivityFormValues } from "../schemas";

export const useAddActivityFormSubmit = () => {
  const { mutate: addActivities, isError, isSuccess } = useActivitiesMutation();
  const onSubmit = useCallback(
    (values: ActivityFormValues) => {
      const activityRecord: ActivityRecordServer = {
        date: format(values.date, "yyyy-MM-dd"),
        name: values.category.name,
        active: values.category.active,
      };
      addActivities([activityRecord]);
    },
    [addActivities]
  );
  return { onSubmit, isError, isSuccess };
};
