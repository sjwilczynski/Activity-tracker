import { useFetcher } from "react-router";
import { useFeedbackToast } from "../../hooks/useFeedbackToast";

export function useAssignCategory({ name }: { name: string }) {
  const fetcher = useFetcher<{ ok?: boolean; error?: string }>();

  const handleAssignCategory = (newCategoryId: string) => {
    fetcher.submit(
      {
        intent: "assign-category",
        activityName: name,
        categoryId: newCategoryId,
      },
      { method: "post" }
    );
  };

  useFeedbackToast(
    {
      isSuccess: fetcher.state === "idle" && fetcher.data?.ok === true,
      isError: fetcher.state === "idle" && fetcher.data?.error !== undefined,
    },
    {
      successMessage: `Category updated for "${name}"`,
      errorMessage: `Failed to assign category for "${name}"`,
    }
  );

  return { handleAssignCategory, isPending: fetcher.state !== "idle" };
}
