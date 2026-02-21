import { Trash2 } from "lucide-react";
import { useCallback } from "react";
import { useFetcher } from "react-router";
import type { ActivityRecordWithId } from "../../../data";
import { useFeedbackToast } from "../../../hooks/useFeedbackToast";
import { formatDate, getActivityIcon } from "../../../utils/activity-icons";
import { cn } from "../../../utils/cn";
import { getActivityColor } from "../../../utils/colors";
import { Button } from "../../ui/button";
import { EditActivityButton } from "./EditActivityDialog";
import { MobileActivityCard } from "./MobileActivityCard";

type Props = {
  record: ActivityRecordWithId;
};

export const RowInReadMode = ({ record }: Props) => {
  const fetcher = useFetcher<{ ok?: boolean; error?: string }>();
  const isDeleting = fetcher.state !== "idle";
  const isError = fetcher.state === "idle" && fetcher.data?.error !== undefined;
  const isSuccess = fetcher.state === "idle" && fetcher.data?.ok === true;
  const color = getActivityColor(record.name);

  useFeedbackToast(
    { isSuccess, isError },
    {
      successMessage: "Successfully deleted the activity",
      errorMessage: "Failed to delete the activity",
    }
  );

  const deleteActivity = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      fetcher.submit(
        {
          intent: "delete",
          id: record.id,
        },
        { method: "post", action: "/activity-list" }
      );
    },
    [record.id, fetcher.submit]
  );

  return (
    <>
      {/* Desktop row */}
      <div
        data-testid="activity-row"
        className={cn(
          "hidden md:flex items-center gap-4 px-4 py-3 rounded-lg transition-all duration-500 hover:bg-secondary dark:hover:bg-[#253550]/50 group",
          isDeleting && "opacity-0 scale-95 pointer-events-none"
        )}
      >
        <div
          className="flex size-9 shrink-0 items-center justify-center rounded-full"
          style={{ backgroundColor: `${color}18`, color }}
        >
          {getActivityIcon(record.name)}
        </div>

        <div className="flex-1 min-w-0">
          <p className="font-medium capitalize text-sm">{record.name}</p>
        </div>

        <span className="text-sm text-muted-foreground shrink-0">
          {formatDate(record.date)}
        </span>

        <div className="flex gap-1 shrink-0 opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity duration-150 [&_button]:size-8 [&_svg]:size-3.5!">
          <EditActivityButton record={record} disabled={isDeleting} />
          <Button
            variant="ghost"
            size="icon"
            className="hover:bg-destructive/10! dark:hover:bg-red-500/15! hover:scale-110 active:scale-95 transition-all duration-150"
            onClick={deleteActivity}
            disabled={isDeleting}
          >
            <Trash2 className="text-destructive dark:text-red-400" />
            <span className="sr-only">Delete</span>
          </Button>
        </div>
      </div>

      <MobileActivityCard
        record={record}
        isDeleting={isDeleting}
        onDelete={deleteActivity}
      />
    </>
  );
};
