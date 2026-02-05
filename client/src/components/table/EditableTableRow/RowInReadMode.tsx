import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import {
  Button,
  CircularProgress,
  TableCell,
  TableRow,
  alpha,
} from "@mui/material";
import { useCallback } from "react";
import { useFetcher } from "react-router";
import type { ActivityRecordWithId } from "../../../data";
import { FeedbackAlertGroup } from "../../states/FeedbackAlertGroup";

type Props = {
  record: ActivityRecordWithId;
  onEdit: () => void;
};

export const RowInReadMode = (props: Props) => {
  const { record, onEdit } = props;
  const fetcher = useFetcher<{ ok?: boolean; error?: string }>();
  const isDeleting = fetcher.state !== "idle";
  const isSuccess = fetcher.data?.ok === true;
  const isError = fetcher.data?.error !== undefined;

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
    [record.id, fetcher]
  );

  return (
    <>
      <TableRow
        onClick={isDeleting ? undefined : onEdit}
        sx={
          isDeleting
            ? {
                opacity: 0.5,
                backgroundColor: (theme) =>
                  alpha(theme.palette.action.disabled, 0.1),
                pointerEvents: "none",
              }
            : undefined
        }
      >
        <TableCell>{record.date.toLocaleDateString("en-CA")}</TableCell>
        <TableCell>{record.name}</TableCell>
        <TableCell>
          <Button
            startIcon={<EditIcon />}
            onClick={onEdit}
            disabled={isDeleting}
          >
            Edit
          </Button>
          <Button
            startIcon={
              isDeleting ? <CircularProgress size={20} /> : <DeleteIcon />
            }
            onClick={deleteActivity}
            disabled={isDeleting}
          >
            {isDeleting ? "Deleting..." : "Delete"}
          </Button>
        </TableCell>
      </TableRow>
      <FeedbackAlertGroup
        isRequestError={isError}
        isRequestSuccess={isSuccess}
        successMessage="Successfully deleted the activity"
        errorMessage="Failed to delete the activity"
      />
    </>
  );
};
