import { useEffect, useRef } from "react";
import { toast } from "sonner";

export function useFeedbackToast(
  { isSuccess, isError }: { isSuccess: boolean; isError: boolean },
  {
    successMessage,
    errorMessage,
  }: { successMessage: string; errorMessage: string }
) {
  const prevSuccess = useRef(false);
  const prevError = useRef(false);

  useEffect(() => {
    if (isSuccess && !prevSuccess.current) {
      toast.success(successMessage);
    }
    prevSuccess.current = isSuccess;
  }, [isSuccess, successMessage]);

  useEffect(() => {
    if (isError && !prevError.current) {
      toast.error(errorMessage);
    }
    prevError.current = isError;
  }, [isError, errorMessage]);
}
