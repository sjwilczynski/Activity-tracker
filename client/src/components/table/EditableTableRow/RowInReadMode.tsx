import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import { Button, TableCell, TableRow } from "@mui/material";
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
  const isSuccess = fetcher.data?.ok === true;
  const isError = fetcher.data?.error !== undefined;

  const deleteActivity = useCallback(() => {
    fetcher.submit(
      {
        intent: "delete",
        id: record.id,
      },
      { method: "post", action: "/activity-list" }
    );
  }, [record.id, fetcher]);

  return (
    <>
      <TableRow onClick={onEdit}>
        <TableCell>{record.date.toLocaleDateString("en-CA")}</TableCell>
        <TableCell>{record.name}</TableCell>
        <TableCell>
          <Button startIcon={<EditIcon />} onClick={onEdit}>
            Edit
          </Button>
          <Button startIcon={<DeleteIcon />} onClick={deleteActivity}>
            Delete
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
