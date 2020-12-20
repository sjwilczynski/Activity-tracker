import { useField, useFormikContext } from "formik";
import { Button } from "@material-ui/core";
import {
  endOfMonth,
  endOfYear,
  startOfMonth,
  startOfToday,
  startOfYear,
} from "date-fns";
import { useCallback } from "react";
import {
  endDateFieldKey,
  FormValues,
  startDateFieldKey,
  useDateRangeState,
  useSetDateRange,
} from "./shared";

export const FormButtons = () => {
  const { resetForm } = useFormikContext<FormValues>();
  const [{ startDate, endDate }, setDateRange] = useDateRangeState();

  const customFormReset = useCallback(() => {
    setDateRange({ startDate: null, endDate: null });
    resetForm({
      values: {
        startDate: null,
        endDate: null,
      },
    });
  }, [resetForm, setDateRange]);
  const showCurrentMonth = useShowCurrentPeriodCallback(
    startOfMonth,
    endOfMonth
  );
  const showCurrentYear = useShowCurrentPeriodCallback(startOfYear, endOfYear);
  return (
    <>
      <Button variant="contained" color="primary" type="submit">
        Set date range
      </Button>
      <Button
        type="button"
        variant="contained"
        color="primary"
        disabled={!startDate || !endDate}
        onClick={customFormReset}
      >
        Clear range
      </Button>
      <Button
        type="button"
        variant="contained"
        color="primary"
        onClick={showCurrentMonth}
      >
        Show current month
      </Button>
      <Button
        type="button"
        variant="contained"
        color="primary"
        onClick={showCurrentYear}
      >
        Show current year
      </Button>
    </>
  );
};

const useShowCurrentPeriodCallback = (
  startOfPeriod: (date: Date) => Date,
  endOfPeriod: (date: Date) => Date
) => {
  const setDateRange = useSetDateRange();
  const [, , { setValue: setStartDate }] = useField<Date | null>(
    startDateFieldKey
  );
  const [, , { setValue: setEndDate }] = useField<Date | null>(endDateFieldKey);
  return useCallback(() => {
    const today = startOfToday();
    const periodStart = startOfPeriod(today);
    const periodEnd = endOfPeriod(today);
    setDateRange({
      startDate: periodStart,
      endDate: periodEnd,
    });
    setStartDate(periodStart);
    setEndDate(periodEnd);
  }, [setDateRange, startOfPeriod, endOfPeriod, setStartDate, setEndDate]);
};
