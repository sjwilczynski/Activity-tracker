import { Button } from "@/components/ui/button";
import { cn } from "@/utils/cn";

type LegendItem = {
  id: string;
  name: string;
  color: string;
  count?: number;
  dash?: string;
};

export function ChartLegend({
  items,
  hidden,
  toggle,
  label,
  compact = false,
}: {
  items: LegendItem[];
  hidden: readonly string[];
  toggle: (id: string) => void;
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
          key={item.id}
          type="button"
          variant="outline"
          size="sm"
          aria-label={`${hidden.includes(item.id) ? "Show" : "Hide"} ${item.name}`}
          aria-pressed={!hidden.includes(item.id)}
          onClick={() => toggle(item.id)}
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
              hidden.includes(item.id) ? "line-through opacity-60" : ""
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

export function toggleHidden(previous: string[], id: string): string[] {
  return previous.includes(id)
    ? previous.filter((item) => item !== id)
    : [...previous, id];
}
