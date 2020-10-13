import DateFnsUtils from "@date-io/date-fns";
import { CssBaseline } from "@material-ui/core";
import { MuiPickersUtilsProvider } from "@material-ui/pickers";
import * as React from "react";

export const UIProvider = ({ children }: { children: React.ReactNode }) => {
  return (
    <MuiPickersUtilsProvider utils={DateFnsUtils}>
      <CssBaseline />
      {children}
    </MuiPickersUtilsProvider>
  );
};
