import { useEffect, useRef } from "react";
import { toast } from "sonner";

export function useFeedbackToast(
  { isSuccess, isError }: { isSuccess: boolean; isError: boolean },
  {
    successMessage,
    errorMessage,
    onSuccess,
  }: { successMessage: string; errorMessage: string; onSuccess?: () => void }
) {
  const prevSuccess = useRef(false);
  const prevError = useRef(false);

  useEffect(() => {
    if (isSuccess && !prevSuccess.current) {
      toast.success(successMessage);
      onSuccess?.();
    }
    prevSuccess.current = isSuccess;
  }, [isSuccess, successMessage, onSuccess]);

  useEffect(() => {
    if (isError && !prevError.current) {
      toast.error(errorMessage);
    }
    prevError.current = isError;
  }, [isError, errorMessage]);
}
