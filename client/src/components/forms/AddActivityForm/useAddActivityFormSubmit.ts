import { format } from "date-fns";
import type { ActivityRecordServer } from "../../../data";
import { useAddActivities } from "../../../data/mutations";
import type { ActivityFormValues } from "../schemas";

export const useAddActivityFormSubmit = () => {
  const mutation = useAddActivities();
  const { isError, isSuccess, isPending } = mutation;

  const onSubmit = (values: ActivityFormValues) => {
    if (isPending) return;
    const activityRecord: ActivityRecordServer = {
      date: format(values.date, "yyyy-MM-dd"),
      name: values.category.name,
      categoryId: values.category.categoryId,
    };
    mutation.mutate([activityRecord]);
  };

  return {
    onSubmit,
    isError,
    isSuccess,
    isPending,
    error: mutation.error,
    reset: mutation.reset,
  };
};
