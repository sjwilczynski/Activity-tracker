import { useMemo } from "react";
import { useIsLightTheme } from "../components/styles/StylesProvider";

function getCssColor(varName: string): string {
  return getComputedStyle(document.documentElement)
    .getPropertyValue(varName)
    .trim();
}

export function useChartColors() {
  const isLight = useIsLightTheme();
  return useMemo(() => {
    const foreground = getCssColor("--color-foreground");
    const mutedForeground = getCssColor("--color-muted-foreground");
    return { foreground, mutedForeground };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- re-compute on theme change
  }, [isLight]);
}
