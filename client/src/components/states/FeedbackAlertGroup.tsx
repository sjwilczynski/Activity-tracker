import { useEffect, useState } from "react";
import { FeedbackAlert } from "./FeedbackAlert";

type Props = {
  isRequestSuccess: boolean;
  isRequestError: boolean;
  successMessage: string;
  errorMessage: string;
};

export const FeedbackAlertGroup = ({
  isRequestSuccess,
  isRequestError,
  successMessage,
  errorMessage,
}: Props) => {
  const [isError, setIsError] = useState<boolean>(false);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);

  useEffect(() => {
    setIsError(isRequestError);
  }, [isRequestError]);
  useEffect(() => {
    setIsSuccess(isRequestSuccess);
  }, [isRequestSuccess]);
  return (
    <>
      <FeedbackAlert
        open={isSuccess}
        setOpen={setIsSuccess}
        severity="success"
        message={successMessage}
      />
      <FeedbackAlert
        open={isError}
        setOpen={setIsError}
        severity="error"
        message={errorMessage}
      />
    </>
  );
};
