import { atom, useAtom, useAtomValue } from "jotai";
import { useCallback, useEffect, type ReactNode } from "react";

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

const funAnimationsAtom = atom(true);
export const useFunAnimations = () => useAtom(funAnimationsAtom);

export function useThemeToggleWithTransition() {
  const [isLightTheme, toggleTheme] = useAtom(themeAtom);

  const toggle = useCallback(() => {
    const supportsViewTransition =
      typeof document !== "undefined" && "startViewTransition" in document;
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    if (!supportsViewTransition || prefersReducedMotion) {
      toggleTheme();
      return;
    }

    document.documentElement.classList.add("theme-transitioning");

    const transition = (
      document as unknown as {
        startViewTransition: (cb: () => void) => {
          finished: Promise<void>;
        };
      }
    ).startViewTransition(() => {
      const root = document.documentElement;
      if (isLightTheme) {
        root.classList.add("dark");
      } else {
        root.classList.remove("dark");
      }
      toggleTheme();
    });

    transition.finished.finally(() => {
      document.documentElement.classList.remove("theme-transitioning");
    });
  }, [isLightTheme, toggleTheme]);

  return [isLightTheme, toggle] as const;
}

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
