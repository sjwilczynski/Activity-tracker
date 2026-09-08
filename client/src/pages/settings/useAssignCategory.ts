import { useAssignActivityCategory } from "../../data/mutations";
import { useFeedbackToast } from "../../hooks/useFeedbackToast";

export function useAssignCategory({ name }: { name: string }) {
  const mutation = useAssignActivityCategory();

  const handleAssignCategory = (newCategoryId: string) => {
    if (!mutation.isPending)
      mutation.mutate({ activityName: name, categoryId: newCategoryId });
  };

  useFeedbackToast(mutation, {
    successMessage: `Category updated for "${name}"`,
    errorMessage: `Failed to assign category for "${name}"`,
  });

  return { handleAssignCategory, isPending: mutation.isPending };
}
