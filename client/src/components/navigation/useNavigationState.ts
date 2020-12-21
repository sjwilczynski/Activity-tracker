import { atom, useAtom } from "jotai";
import { useUpdateAtom } from "jotai/utils";

const isNavigationOpenAtom = atom(false);
const navigationAtom = atom(
  (get) => get(isNavigationOpenAtom),
  (get, set) => set(isNavigationOpenAtom, !get(isNavigationOpenAtom))
);
export const useNavigationState = () => useAtom(navigationAtom);
export const useNavigationToggle = () => useUpdateAtom(navigationAtom);
