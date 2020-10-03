import * as React from "react";

export const ErrorView = (props: { error: Error }) => {
  return <div>{"An error has occurred: " + props.error.message}</div>;
};
