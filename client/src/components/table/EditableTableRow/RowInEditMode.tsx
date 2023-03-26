import { Button, TableCell, TableRow } from "@mui/material";
import CancelIcon from "@mui/icons-material/Cancel";
import type { ActivityRecordWithId } from "../../../data";

type Props = {
  record: ActivityRecordWithId;
  onCancel: () => void;
};

export const RowInEditMode = (props: Props) => {
  console.log(props.record);
  return (
    <TableRow>
      <TableCell>{props.record.date.toLocaleDateString("en-CA")}</TableCell>
      <TableCell>{props.record.name}</TableCell>
      <TableCell>
        <Button startIcon={<CancelIcon />} onClick={props.onCancel}>
          Cancel
        </Button>
      </TableCell>
    </TableRow>
  );
};
