import * as React from "react";
import { RouteComponentProps } from "react-router-dom";

type Props = RouteComponentProps;

export const PageNotFound = ({ history }: Props) => {
  return (
    <div>
      404: Page not found{" "}
      <button onClick={() => history.push("/")}>Go back to welcome page</button>
    </div>
  );
};
