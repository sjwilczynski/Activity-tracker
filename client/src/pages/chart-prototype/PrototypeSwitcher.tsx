import { ArrowLeft, ArrowRight } from "lucide-react";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";

export const variants = [
  {
    id: "baseline",
    label: "A / Current Chart.js",
    description: "Existing charts and options",
  },
  {
    id: "parity",
    label: "B / TanStack parity",
    description: "Same shapes, typed data, keyboard interaction",
  },
  {
    id: "clarity",
    label: "C / Clearer questions",
    description: "Ranked bars, separate summaries, labeled lines",
  },
] as const;
export type PrototypeVariant = (typeof variants)[number]["id"];

export function PrototypeSwitcher({
  variant,
  onChange,
}: {
  variant: PrototypeVariant;
  onChange: (variant: PrototypeVariant) => void;
}) {
  const index = variants.findIndex((entry) => entry.id === variant);
  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      if (
        !(event.target instanceof HTMLElement) ||
        event.target.closest(
          "input,textarea,select,button,[contenteditable],[data-chart-surface],[role=dialog]"
        )
      )
        return;
      if (event.altKey || event.ctrlKey || event.metaKey) return;
      if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
      event.preventDefault();
      onChange(variants[(index + (event.key === "ArrowLeft" ? 2 : 1)) % 3].id);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [index, onChange]);
  if (!import.meta.env.DEV) return null;
  return (
    <nav
      aria-label="Chart prototype variants"
      className="fixed bottom-4 left-1/2 z-50 flex w-[min(95vw,540px)] -translate-x-1/2 items-center gap-2 rounded-2xl border border-foreground/20 bg-foreground p-2 text-background shadow-xl"
    >
      <Button
        variant="ghost"
        size="icon"
        className="shrink-0 text-inherit hover:bg-background/15 hover:text-inherit"
        aria-label="Previous prototype variant"
        onClick={() => onChange(variants[(index + 2) % 3].id)}
      >
        <ArrowLeft className="size-4" />
      </Button>
      <div className="min-w-0 flex-1 text-center">
        <label className="sr-only" htmlFor="chart-variant">
          Prototype variant
        </label>
        <select
          id="chart-variant"
          value={variant}
          className="w-full appearance-none bg-foreground py-1 text-center text-sm font-semibold text-background outline-offset-2"
          onChange={(event) => {
            const selected = variants.find(
              (entry) => entry.id === event.target.value
            );
            if (selected) onChange(selected.id);
          }}
        >
          {variants.map((entry) => (
            <option
              key={entry.id}
              value={entry.id}
              className="bg-background text-foreground"
            >
              {entry.label}
            </option>
          ))}
        </select>
        <p className="truncate text-[10px] opacity-75">
          {variants[index].description}
        </p>
      </div>
      <Button
        variant="ghost"
        size="icon"
        className="shrink-0 text-inherit hover:bg-background/15 hover:text-inherit"
        aria-label="Next prototype variant"
        onClick={() => onChange(variants[(index + 1) % 3].id)}
      >
        <ArrowRight className="size-4" />
      </Button>
    </nav>
  );
}
