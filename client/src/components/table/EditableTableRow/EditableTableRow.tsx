import { useCallback, useState } from "react";
import type { ActivityRecordWithId } from "../../../data";
import { EditActivityDialog } from "./EditActivityDialog";
import { RowInReadMode } from "./RowInReadMode";

type Props = {
  record: ActivityRecordWithId;
};

export function EditableTableRow(props: Props) {
  const [isEditMode, setIsEditMode] = useState(false);

  const handleEditClick = useCallback(() => {
    setIsEditMode(true);
  }, []);

  const handleClose = useCallback(() => {
    setIsEditMode(false);
  }, []);

  return (
    <>
      <RowInReadMode record={props.record} onEdit={handleEditClick} />
      {isEditMode && (
        <EditActivityDialog
          record={props.record}
          isOpen={isEditMode}
          onClose={handleClose}
        />
      )}
    </>
  );
}
