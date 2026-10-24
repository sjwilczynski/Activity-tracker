import { useId, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/utils/cn";
import type { ActivityPoint } from "./chart-model";

export const plotTheme = {
  foreground: "var(--color-foreground)",
  muted: "var(--color-muted-foreground)",
  grid: "var(--color-border)",
  background: "var(--color-card)",
};
export const plotAnimation = { duration: 180, respectReducedMotion: true };

export function PlotFrame({
  title,
  description,
  children,
  className,
}: {
  title: string;
  description: string;
  children: ReactNode;
  className?: string;
}) {
  const id = useId();
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle id={id}>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <figure aria-labelledby={id} className="min-w-0 space-y-4">
          {children}
        </figure>
      </CardContent>
    </Card>
  );
}

export function ChartLegend({
  items,
  hidden,
  toggle,
  label,
  compact = false,
}: {
  items: { name: string; color: string; count?: number; dash?: string }[];
  hidden: readonly string[];
  toggle: (name: string) => void;
  label: string;
  compact?: boolean;
}) {
  return (
    <div
      role="group"
      aria-label={label}
      className={cn(
        compact
          ? "grid max-h-[400px] min-w-0 grid-cols-[repeat(auto-fit,minmax(min(100%,9rem),1fr))] content-start gap-x-2 gap-y-0.5 overflow-y-auto overscroll-contain p-1"
          : "flex flex-wrap gap-1.5"
      )}
    >
      {items.map((item) => (
        <Button
          key={item.name}
          type="button"
          variant="outline"
          size="sm"
          aria-label={`${hidden.includes(item.name) ? "Show" : "Hide"} ${item.name}`}
          aria-pressed={!hidden.includes(item.name)}
          onClick={() => toggle(item.name)}
          className={cn(
            "h-auto max-w-full justify-start whitespace-normal text-left",
            compact
              ? "min-h-6 w-full gap-1.5 rounded-sm border-transparent bg-transparent px-1 py-0.5 text-[11px]"
              : "min-h-9 text-xs"
          )}
        >
          <svg
            width="18"
            height="12"
            viewBox="0 0 18 12"
            aria-hidden="true"
            className={compact ? "w-3 shrink-0" : "shrink-0"}
          >
            {item.dash !== undefined ? (
              <line
                x1="0"
                y1="6"
                x2="18"
                y2="6"
                stroke={item.color}
                strokeWidth="3"
                strokeDasharray={item.dash}
              />
            ) : (
              <rect width="12" height="12" rx="3" fill={item.color} />
            )}
          </svg>
          <span
            className={
              hidden.includes(item.name) ? "line-through opacity-60" : ""
            }
          >
            {item.name}
            {item.count !== undefined ? ` (${item.count})` : ""}
          </span>
        </Button>
      ))}
    </div>
  );
}

export function ActivityDataTable({ points }: { points: ActivityPoint[] }) {
  const total = points.reduce((sum, point) => sum + point.count, 0);
  return (
    <details className="rounded-lg border bg-background/50 px-3 py-2">
      <summary className="cursor-pointer text-sm font-medium focus-visible:outline-2 focus-visible:outline-ring">
        View exact activity data ({points.length} activities)
      </summary>
      <div className="mt-3 overflow-x-auto">
        <table className="w-full text-left text-sm">
          <caption className="sr-only">
            Activity counts in the selected date range
          </caption>
          <thead>
            <tr className="border-b">
              <th scope="col" className="p-2">
                Activity
              </th>
              <th scope="col" className="p-2">
                Category
              </th>
              <th scope="col" className="p-2">
                Status
              </th>
              <th scope="col" className="p-2 text-right">
                Count
              </th>
              <th scope="col" className="p-2 text-right">
                Share
              </th>
            </tr>
          </thead>
          <tbody>
            {points.map((point) => (
              <tr key={point.name} className="border-b last:border-0">
                <th scope="row" className="p-2 font-medium">
                  {point.name}
                </th>
                <td className="p-2">{point.category}</td>
                <td className="p-2">{point.active ? "Active" : "Inactive"}</td>
                <td className="p-2 text-right tabular-nums">{point.count}</td>
                <td className="p-2 text-right tabular-nums">
                  {total ? ((point.count / total) * 100).toFixed(1) : "0.0"}%
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </details>
  );
}

export function KeyboardHint({ legend = true }: { legend?: boolean }) {
  return (
    <p className="text-xs text-muted-foreground">
      Keyboard: Tab into the plot, then use arrow keys to explore values.
      {legend && " Legend buttons hide or show series."}
    </p>
  );
}
