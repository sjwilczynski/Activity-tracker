import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
} from "@material-ui/core";
import * as React from "react";
import { ActivityRecordWithId } from "../../data";

type Props = {
  records: ActivityRecordWithId[];
};

export function SummaryTable(props: Props) {
  const { records } = props;

  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(10);

  const changePage = (_event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const changeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };
  if (!records) {
    return <></>;
  }
  return (
    <Paper>
      <TableContainer>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Date</TableCell>
              <TableCell>Activity name</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {records
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((record) => (
                <TableRow key={record.id}>
                  <TableCell>
                    {record.date.toLocaleDateString("en-CA")}
                  </TableCell>
                  <TableCell>{record.name}</TableCell>
                </TableRow>
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
        onChangePage={changePage}
        onChangeRowsPerPage={changeRowsPerPage}
      />
    </Paper>
  );
}
