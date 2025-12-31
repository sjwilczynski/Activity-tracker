import { useSearchParams } from "react-router-dom";
import { useCallback, useMemo } from "react";

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
  const date = new Date(dateString);
  return isNaN(date.getTime()) ? null : date;
};

export const useDateRange = (): FormValues => {
  const [searchParams] = useSearchParams();

  return useMemo(() => ({
    startDate: deserializeDate(searchParams.get(startDateFieldKey)),
    endDate: deserializeDate(searchParams.get(endDateFieldKey)),
  }), [searchParams]);
};

export const useDateRangeState = (): [FormValues, (values: FormValues) => void] => {
  const [searchParams, setSearchParams] = useSearchParams();

  const dateRange = useMemo(() => ({
    startDate: deserializeDate(searchParams.get(startDateFieldKey)),
    endDate: deserializeDate(searchParams.get(endDateFieldKey)),
  }), [searchParams]);

  const setDateRange = useCallback((values: FormValues) => {
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
