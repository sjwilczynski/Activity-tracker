import { format } from "date-fns";
import { useCallback } from "react";
import {
  useActivitiesMutation,
  type ActivityRecordServer,
} from "../../../data";
import type { FormValues } from "./FormWrapper";

export const useAddActivityFormSubmit = () => {
  const { mutate: addActivities, isError, isSuccess } = useActivitiesMutation();
  const onSubmit = useCallback(
    (values: FormValues) => {
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
