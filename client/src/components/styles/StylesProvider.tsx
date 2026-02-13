import { atom, useAtom, useAtomValue } from "jotai";
import { useEffect, type ReactNode } from "react";

type Props = {
  children: ReactNode;
};

const isLightThemeAtom = atom(true);
const themeAtom = atom(
  (get) => get(isLightThemeAtom),
  (get, set) => set(isLightThemeAtom, !get(isLightThemeAtom))
);
export const useIsLightTheme = () => useAtomValue(themeAtom);
export const useThemeState = () => useAtom(themeAtom);

const groupByCategoryAtom = atom(true);
export const useGroupByCategory = () => useAtom(groupByCategoryAtom);

export const StylesProvider = ({ children }: Props) => {
  const isLightTheme = useIsLightTheme();

  // Sync dark class on <html> for Tailwind dark mode
  useEffect(() => {
    const root = document.documentElement;
    if (isLightTheme) {
      root.classList.remove("dark");
    } else {
      root.classList.add("dark");
    }
  }, [isLightTheme]);

  return <>{children}</>;
};
