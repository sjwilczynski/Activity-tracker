import { useSearchParams } from "react-router-dom";
import { useCallback, useMemo } from "react";
import { parseISO, isValid } from "date-fns";

export type FormValues = {
  startDate: Date | null;
  endDate: Date | null;
};

export const startDateFieldKey = "startDate";
export const endDateFieldKey = "endDate";

const serializeDate = (date: Date | null): string | null => {
  if (!date) return null;
  return date.toISOString().split('T')[0];
};

const deserializeDate = (dateString: string | null): Date | null => {
  if (!dateString) return null;
  const date = parseISO(dateString);
  return isValid(date) ? date : null;
};

export const useDateRange = (): FormValues => {
  const [searchParams] = useSearchParams();
  const startDateParam = searchParams.get(startDateFieldKey);
  const endDateParam = searchParams.get(endDateFieldKey);

  return useMemo(() => ({
    startDate: deserializeDate(startDateParam),
    endDate: deserializeDate(endDateParam),
  }), [startDateParam, endDateParam]);
};

export const useDateRangeState = (): [FormValues, (values: FormValues) => void] => {
  const [searchParams, setSearchParams] = useSearchParams();
  const startDateParam = searchParams.get(startDateFieldKey);
  const endDateParam = searchParams.get(endDateFieldKey);

  const dateRange = useMemo(() => ({
    startDate: deserializeDate(startDateParam),
    endDate: deserializeDate(endDateParam),
  }), [startDateParam, endDateParam]);

  const setDateRange = useCallback((values: FormValues) => {
    // NOTE: Including searchParams in deps causes callback recreation on URL changes.
    // To optimize, upgrade react-router-dom to 6.4+ and use functional updater:
    // setSearchParams((currentParams) => { ... return newParams; })
    const newParams = new URLSearchParams(searchParams);

    const serializedStart = serializeDate(values.startDate);
    const serializedEnd = serializeDate(values.endDate);

    if (serializedStart) {
      newParams.set(startDateFieldKey, serializedStart);
    } else {
      newParams.delete(startDateFieldKey);
    }

    if (serializedEnd) {
      newParams.set(endDateFieldKey, serializedEnd);
    } else {
      newParams.delete(endDateFieldKey);
    }

    setSearchParams(newParams);
  }, [searchParams, setSearchParams]);

  return [dateRange, setDateRange];
};

export const useSetDateRange = (): ((values: FormValues) => void) => {
  const [, setDateRange] = useDateRangeState();
  return setDateRange;
};
