import * as React from "react";
import { Table } from "react-bootstrap";
import { ActivityRecordWithId } from "../../data/types";

type Props = {
  records: ActivityRecordWithId[];
};

export function SummaryTable(props: Props) {
  const { records } = props;
  if (!records) {
    return <></>;
  }
  return (
    <Table responsive striped bordered hover>
      <thead>
        <tr>
          <th>Date</th>
          <th>Activity name</th>
        </tr>
      </thead>
      <tbody>
        {records.map((record) => (
          <tr key={record.id}>
            <td>{record.date.toLocaleDateString("en-CA")}</td>
            <td>{record.activity.name}</td>
          </tr>
        ))}
      </tbody>
    </Table>
  );
}
