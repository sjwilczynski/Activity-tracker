import { getRouteApi, useNavigate } from "@tanstack/react-router";
import { deserializeDate, serializeDate } from "../../../app/search";

export type FormValues = { startDate: Date | null; endDate: Date | null };

export const useDateRange = (): FormValues => {
  const search = getRouteApi("__root__").useSearch();
  return {
    startDate: deserializeDate(search.startDate),
    endDate: deserializeDate(search.endDate),
  };
};

export const useDateRangeState = (): [
  FormValues,
  (values: FormValues) => void,
] => {
  const dateRange = useDateRange();
  const navigate = useNavigate();
  return [
    dateRange,
    (values) => {
      void navigate({
        to: ".",
        search: (previous) => ({
          ...previous,
          startDate: serializeDate(values.startDate),
          endDate: serializeDate(values.endDate),
        }),
      });
    },
  ];
};
