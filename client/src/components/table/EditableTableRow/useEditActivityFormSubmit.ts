import { format } from "date-fns";
import type { ActivityRecordServer, Intensity } from "../../../data";
import { useEditActivity } from "../../../data/mutations";
import type { DetailedActivityFormValues } from "../../forms/schemas";

export const useEditActivityFormSubmit = (id: string) => {
  const mutation = useEditActivity();
  const { isError, isSuccess, isPending } = mutation;

  const onSubmit = (values: DetailedActivityFormValues) => {
    if (isPending) return;
    const activityRecord: ActivityRecordServer = {
      date: format(values.date, "yyyy-MM-dd"),
      name: values.category.name,
      categoryId: values.category.categoryId,
    };
    if (values.intensity)
      activityRecord.intensity = values.intensity as Intensity;
    if (values.timeSpent) activityRecord.timeSpent = Number(values.timeSpent);
    if (values.description.trim())
      activityRecord.description = values.description.trim();
    mutation.mutate({ id, record: activityRecord });
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
