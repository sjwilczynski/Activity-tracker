import "./charts.css";

export const chartTheme = {
  foreground: "var(--color-foreground)",
  muted: "var(--color-muted-foreground)",
  grid: "var(--color-border)",
  background: "var(--color-card)",
};

export const chartAnimation = { duration: 180, respectReducedMotion: true };

export function formatCount(value: unknown): string {
  return Number.isInteger(Number(value)) ? String(value) : "";
}

export function entryCount(count: number): string {
  return `${count} ${count === 1 ? "entry" : "entries"}`;
}
