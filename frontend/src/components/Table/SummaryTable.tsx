import * as React from "react";
import { Table } from "react-bootstrap";
import { ActivityRecord } from "../../data/types";

type Props = {
  data: ActivityRecord[];
};

export function SummaryTable(props: Props) {
  const { data } = props;
  if (!data) {
    return <></>;
  }
  return (
    <Table responsive striped bordered hover>
      <thead>
        <th>Date</th>
        <th>Activity name</th>
      </thead>
      <tbody>
        {data.map((record) => (
          <tr>
            <td>{record.date}</td>
            <td>{record.activity.name}</td>
          </tr>
        ))}
      </tbody>
    </Table>
  );
}
