import DateFnsUtils from "@date-io/date-fns";
import { MuiPickersUtilsProvider } from "@material-ui/pickers";
import * as React from "react";

export const PickersContextProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  return (
    <MuiPickersUtilsProvider utils={DateFnsUtils}>
      {children}
    </MuiPickersUtilsProvider>
  );
};
