import { cn } from "../utils/cn";
import { getCategoryColor } from "../utils/colors";

type Props = {
  name: string;
  className?: string;
};

export function CategoryBadge({ name, className }: Props) {
  const normalizedName = name.trim();
  if (!normalizedName) return null;
  const color = getCategoryColor(normalizedName);
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold whitespace-nowrap shrink-0",
        className
      )}
      style={{ backgroundColor: `${color}1f`, color }}
    >
      {normalizedName}
    </span>
  );
}
