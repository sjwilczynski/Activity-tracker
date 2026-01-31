import type { AnyFormApi } from "@tanstack/react-form";
import { Button } from "@mui/material";
import {
  endOfMonth,
  endOfYear,
  startOfMonth,
  startOfToday,
  startOfYear,
} from "date-fns";
import { useCallback } from "react";
import { useDateRangeState, useSetDateRange } from "./shared";

type FormButtonsProps = {
  form: AnyFormApi;
};

export const FormButtons = ({ form }: FormButtonsProps) => {
  const [{ startDate, endDate }, setDateRange] = useDateRangeState();

  const customFormReset = useCallback(() => {
    setDateRange({ startDate: null, endDate: null });
    form.reset();
    form.setFieldValue("startDate", null);
    form.setFieldValue("endDate", null);
  }, [form, setDateRange]);

  const showCurrentMonth = useShowCurrentPeriodCallback(
    form,
    startOfMonth,
    endOfMonth
  );
  const showCurrentYear = useShowCurrentPeriodCallback(
    form,
    startOfYear,
    endOfYear
  );

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
  form: AnyFormApi,
  startOfPeriod: (date: Date) => Date,
  endOfPeriod: (date: Date) => Date
) => {
  const setDateRange = useSetDateRange();

  return useCallback(() => {
    const today = startOfToday();
    const periodStart = startOfPeriod(today);
    const periodEnd = endOfPeriod(today);
    setDateRange({
      startDate: periodStart,
      endDate: periodEnd,
    });
    form.setFieldValue("startDate", periodStart);
    form.setFieldValue("endDate", periodEnd);
  }, [setDateRange, startOfPeriod, endOfPeriod, form]);
};
