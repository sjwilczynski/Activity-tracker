import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
} from "@mui/material";
import type { ChangeEvent } from "react";
import { useState } from "react";
import type { ActivityRecordWithId } from "../../data";
import { EditableTableRow } from "./EditableTableRow/EditableTableRow";

type Props = {
  records: ActivityRecordWithId[];
};

export function SummaryTable(props: Props) {
  const { records } = props;

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const changePage = (_event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const changeRowsPerPage = (event: ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };
  if (!records) {
    return <></>;
  }
  return (
    <Paper elevation={8}>
      <TableContainer>
        <Table
          size="small"
          sx={{
            tableLayout: "fixed",
            width: "100%",
          }}
        >
          <TableHead>
            <TableRow>
              <TableCell>Date</TableCell>
              <TableCell>Activity name</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {records
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((record) => (
                <EditableTableRow key={record.id} record={record} />
              ))}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination
        rowsPerPageOptions={[10, 20, 50, 100]}
        component="div"
        count={records.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={changePage}
        onRowsPerPageChange={changeRowsPerPage}
      />
    </Paper>
  );
}
