import { HEATMAP_LEVELS, levelBackground } from "./heatmap-colors";

export function HeatmapLegend() {
  return (
    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
      <span>Less</span>
      <div className="flex items-center gap-1" aria-hidden="true">
        {HEATMAP_LEVELS.map((level) => (
          <span
            key={level}
            data-level={level}
            className="size-[12px] rounded-[3px] shadow-[inset_0_0_0_1px_rgba(0,0,0,0.06)]"
            style={{ backgroundColor: levelBackground(level) }}
          />
        ))}
      </div>
      <span>More</span>
    </div>
  );
}
