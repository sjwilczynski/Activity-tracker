import { useSyncExternalStore } from "react";

type ChartColors = {
  foreground: string;
  mutedForeground: string;
};

function readColors(): ChartColors {
  const style = getComputedStyle(document.documentElement);
  return {
    foreground: style.getPropertyValue("--color-foreground").trim(),
    mutedForeground: style.getPropertyValue("--color-muted-foreground").trim(),
  };
}

let cached: ChartColors = { foreground: "", mutedForeground: "" };

function getSnapshot(): ChartColors {
  const next = readColors();
  if (
    next.foreground !== cached.foreground ||
    next.mutedForeground !== cached.mutedForeground
  ) {
    cached = next;
  }
  return cached;
}

function subscribe(callback: () => void) {
  const observer = new MutationObserver(callback);
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["class"],
  });
  return () => observer.disconnect();
}

export function useChartColors() {
  return useSyncExternalStore(subscribe, getSnapshot);
}
