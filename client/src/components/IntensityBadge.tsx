import { intensityLabels, intensityStyles } from "../utils/intensity";

export function IntensityBadge({ intensity }: { intensity: string }) {
  const style = intensityStyles[intensity];
  const label = intensityLabels[intensity];
  if (!style || !label) return null;
  return (
    <>
      <span
        className="text-[10px] font-bold px-2 py-0.5 rounded-full dark:hidden"
        style={{ backgroundColor: style.bg, color: style.text }}
      >
        {label}
      </span>
      <span
        className="text-[10px] font-bold px-2 py-0.5 rounded-full hidden dark:inline"
        style={{ backgroundColor: style.darkBg, color: style.darkText }}
      >
        {label}
      </span>
    </>
  );
}
