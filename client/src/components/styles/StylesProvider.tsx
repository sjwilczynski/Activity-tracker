import { createMuiTheme, CssBaseline, ThemeProvider } from "@material-ui/core";
import * as React from "react";

type Props = {
  children: React.ReactNode;
};

export const StylesProvider = ({ children }: Props) => {
  const theme = createMuiTheme({});
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {children}
    </ThemeProvider>
  );
};
