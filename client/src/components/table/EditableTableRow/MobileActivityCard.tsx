import { Pencil, Trash2 } from "lucide-react";
import type { ActivityRecordWithId } from "../../../data";
import { formatDate, getActivityIcon } from "../../../utils/activity-icons";
import { cn } from "../../../utils/cn";
import { getActivityColor } from "../../../utils/colors";
import { Button } from "../../ui/button";

type Props = {
  record: ActivityRecordWithId;
  isDeleting: boolean;
  onEdit: () => void;
  onDelete: (e: React.MouseEvent) => void;
};

export const MobileActivityCard = ({
  record,
  isDeleting,
  onEdit,
  onDelete,
}: Props) => {
  const color = getActivityColor(record.name);

  return (
    <div
      className={cn(
        "md:hidden rounded-lg border p-4 space-y-3",
        isDeleting && "opacity-50 pointer-events-none"
      )}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3 flex-1">
          <div
            className="flex size-9 shrink-0 items-center justify-center rounded-full"
            style={{ backgroundColor: `${color}18`, color }}
          >
            {getActivityIcon(record.name)}
          </div>
          <div className="flex-1">
            <p className="font-semibold capitalize">{record.name}</p>
            <p className="text-sm text-muted-foreground">
              {formatDate(record.date)}
            </p>
          </div>
        </div>
        <div className="flex gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="hover:!bg-primary/10 hover:!text-primary hover:scale-110 active:scale-95 transition-all duration-150"
            onClick={onEdit}
            disabled={isDeleting}
          >
            <Pencil className="size-4" />
            <span className="sr-only">Edit</span>
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="hover:!bg-destructive/10 dark:hover:!bg-red-500/15 hover:scale-110 active:scale-95 transition-all duration-150"
            onClick={onDelete}
            disabled={isDeleting}
          >
            <Trash2 className="size-4 text-destructive dark:text-red-400" />
            <span className="sr-only">Delete</span>
          </Button>
        </div>
      </div>
    </div>
  );
};
