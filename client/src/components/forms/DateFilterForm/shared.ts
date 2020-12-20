import { atom, useAtom } from "jotai";
import { useAtomValue, useUpdateAtom } from "jotai/utils";

export type FormValues = {
  startDate: Date | null;
  endDate: Date | null;
};

export const startDateFieldKey = "startDate";
export const endDateFieldKey = "endDate";

const dateRangeAtom = atom<FormValues>({
  startDate: null,
  endDate: null,
});

export const useDateRange = () => useAtomValue(dateRangeAtom);
export const useDateRangeState = () => useAtom(dateRangeAtom);
export const useSetDateRange = () => useUpdateAtom(dateRangeAtom);
