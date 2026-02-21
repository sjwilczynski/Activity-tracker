import { useCallback, useEffect, type ReactNode } from "react";
import {
  useFunAnimations,
  useGroupByCategory,
  useIsLightTheme,
  useSetIsLightTheme,
} from "../../data/hooks/preferences/useUserPreferences";

type Props = {
  children: ReactNode;
};

export { useFunAnimations, useGroupByCategory, useIsLightTheme };

export function useThemeToggleWithTransition() {
  const isLightTheme = useIsLightTheme();
  const setIsLightTheme = useSetIsLightTheme();

  const toggle = useCallback(() => {
    const supportsViewTransition =
      typeof document !== "undefined" && "startViewTransition" in document;
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    if (!supportsViewTransition || prefersReducedMotion) {
      setIsLightTheme(!isLightTheme);
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
      setIsLightTheme(!isLightTheme);
    });

    transition.finished.finally(() => {
      document.documentElement.classList.remove("theme-transitioning");
    });
  }, [isLightTheme, setIsLightTheme]);

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
