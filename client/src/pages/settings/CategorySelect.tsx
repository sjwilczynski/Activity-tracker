import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import type { Category } from "../../data";

export function CategorySelect({
  categoryId,
  categories,
  onValueChange,
  className,
  disabled,
}: {
  categoryId: string | undefined;
  categories: Category[];
  onValueChange: (value: string) => void;
  className?: string;
  disabled?: boolean;
}) {
  return (
    <Select
      value={categoryId ?? ""}
      onValueChange={onValueChange}
      disabled={disabled}
    >
      <SelectTrigger className={className}>
        <SelectValue placeholder="Select category" />
      </SelectTrigger>
      <SelectContent>
        {categories.map((cat) => (
          <SelectItem key={cat.id} value={cat.id}>
            {cat.name} ({cat.active ? "active" : "inactive"})
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
