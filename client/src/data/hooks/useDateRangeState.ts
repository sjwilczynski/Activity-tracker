import { useCallback, useState } from "react";

export const useDateRangeState = () => {
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);

  const setDateRange = useCallback(
    (start: Date | undefined, end: Date | undefined) => {
      setStartDate(start);
      setEndDate(end);
    },
    []
  );

  return { startDate, endDate, setDateRange };
};
