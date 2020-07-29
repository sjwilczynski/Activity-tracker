import * as React from "react";
import { Table } from "react-bootstrap";
import { ActivityRecord } from "../../data/types";

type Props = {
  records: ActivityRecord[];
};

export function SummaryTable(props: Props) {
  const { records } = props;
  if (!records) {
    return <></>;
  }
  return (
    <Table responsive striped bordered hover>
      <thead>
        <th>Date</th>
        <th>Activity name</th>
      </thead>
      <tbody>
        {records.map((record) => (
          <tr>
            <td>{record.date}</td>
            <td>{record.activity.name}</td>
          </tr>
        ))}
      </tbody>
    </Table>
  );
}
