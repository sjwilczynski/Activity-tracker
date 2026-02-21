import { useEffect, useState } from "react";
import { useIsLightTheme } from "../components/styles/StylesProvider";

function readColors() {
  const style = getComputedStyle(document.documentElement);
  return {
    foreground: style.getPropertyValue("--color-foreground").trim(),
    mutedForeground: style.getPropertyValue("--color-muted-foreground").trim(),
  };
}

export function useChartColors() {
  const isLight = useIsLightTheme();
  const [colors, setColors] = useState(readColors);

  useEffect(() => {
    setColors(readColors());
  }, [isLight]);

  return colors;
}
