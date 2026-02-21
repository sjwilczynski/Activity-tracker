import { QueryClientContext } from "@tanstack/react-query";
import { useCallback, useContext, useEffect, type ReactNode } from "react";
import {
  useFunAnimations,
  useGroupByCategory,
  useIsLightTheme as useIsLightThemeFromQuery,
  useSetIsLightTheme,
} from "../../data/hooks/preferences/useUserPreferences";

type Props = {
  children: ReactNode;
};

export { useFunAnimations, useGroupByCategory };

/**
 * Safe wrapper that falls back to reading the DOM class when QueryClientProvider
 * is unavailable (e.g. during sign-out route transition).
 */
export function useIsLightTheme(): boolean {
  const queryClient = useContext(QueryClientContext);
  if (!queryClient) {
    return !document.documentElement.classList.contains("dark");
  }
  // eslint-disable-next-line react-hooks/rules-of-hooks -- only called when queryClient is stable (present for entire authenticated session)
  return useIsLightThemeFromQuery();
}

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
