import { createContext, useContext, useEffect, type ReactNode } from "react";
import { useAuthContext } from "../../auth/AuthContext";
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

const ThemeContext = createContext<boolean | undefined>(undefined);

export function useIsLightTheme(): boolean {
  return (
    useContext(ThemeContext) ??
    (typeof document === "undefined" ||
      !document.documentElement.classList.contains("dark"))
  );
}

export function useThemeToggleWithTransition() {
  const isLightTheme = useIsLightTheme();
  const setIsLightTheme = useSetIsLightTheme();

  const toggle = () => {
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

    void transition.finished.finally(() => {
      document.documentElement.classList.remove("theme-transitioning");
    });
  };

  return [isLightTheme, toggle] as const;
}

const AuthenticatedStyles = ({ children }: Props) => {
  const isLightTheme = useIsLightThemeFromQuery();

  // Sync dark class on <html> for Tailwind dark mode
  useEffect(() => {
    const root = document.documentElement;
    if (isLightTheme) {
      root.classList.remove("dark");
    } else {
      root.classList.add("dark");
    }
  }, [isLightTheme]);

  return (
    <ThemeContext.Provider value={isLightTheme}>
      {children}
    </ThemeContext.Provider>
  );
};

export const StylesProvider = ({ children }: Props) => {
  const { user } = useAuthContext();
  return user ? (
    <AuthenticatedStyles>{children}</AuthenticatedStyles>
  ) : (
    <>{children}</>
  );
};
