import { isValid, parseISO } from "date-fns";
import { useCallback, useMemo } from "react";
import { useSearchParams } from "react-router";

export type FormValues = {
  startDate: Date | null;
  endDate: Date | null;
};

export const startDateFieldKey = "startDate";
export const endDateFieldKey = "endDate";

const serializeDate = (date: Date | null): string | null => {
  if (!date) return null;
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
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

  return useMemo(
    () => ({
      startDate: deserializeDate(startDateParam),
      endDate: deserializeDate(endDateParam),
    }),
    [startDateParam, endDateParam]
  );
};

export const useDateRangeState = (): [
  FormValues,
  (values: FormValues) => void,
] => {
  const [searchParams, setSearchParams] = useSearchParams();
  const startDateParam = searchParams.get(startDateFieldKey);
  const endDateParam = searchParams.get(endDateFieldKey);

  const dateRange = useMemo(
    () => ({
      startDate: deserializeDate(startDateParam),
      endDate: deserializeDate(endDateParam),
    }),
    [startDateParam, endDateParam]
  );

  const setDateRange = useCallback(
    (values: FormValues) => {
      setSearchParams((currentParams) => {
        const newParams = new URLSearchParams(currentParams);

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

        return newParams;
      });
    },
    [setSearchParams]
  );

  return [dateRange, setDateRange];
};
