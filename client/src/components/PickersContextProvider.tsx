import DateFnsUtils from "@date-io/date-fns";
import { MuiPickersUtilsProvider } from "@material-ui/pickers";

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
