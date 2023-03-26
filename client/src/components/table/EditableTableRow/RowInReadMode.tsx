import { TableRow, TableCell, Button } from "@mui/material";
import type { ActivityRecordWithId } from "../../../data";
import { useDeleteActivity } from "../../../data";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import { useCallback } from "react";
import { FeedbackAlertGroup } from "../../states/FeedbackAlertGroup";

type Props = {
  record: ActivityRecordWithId;
  onEdit: () => void;
};

export const RowInReadMode = (props: Props) => {
  const { record, onEdit } = props;
  const { mutate, isSuccess, isError } = useDeleteActivity();
  const deleteActivity = useCallback(() => {
    mutate(record.id);
  }, [record.id]);
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
