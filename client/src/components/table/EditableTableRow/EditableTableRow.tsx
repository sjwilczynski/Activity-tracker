import { useCallback, useState } from "react";
import type { ActivityRecordWithId } from "../../../data";
import { RowInEditMode } from "./RowInEditMode";
import { RowInReadMode } from "./RowInReadMode";

type Props = {
  record: ActivityRecordWithId;
};

export function EditableTableRow(props: Props) {
  const [isEditMode, setIsEditMode] = useState(false);

  const handleEditClick = useCallback(() => {
    setIsEditMode(true);
  }, []);

  const handleCancelClick = useCallback(() => {
    setIsEditMode(false);
  }, []);

  return isEditMode ? (
    <RowInEditMode record={props.record} onCancel={handleCancelClick} />
  ) : (
    <RowInReadMode record={props.record} onEdit={handleEditClick} />
  );
}
