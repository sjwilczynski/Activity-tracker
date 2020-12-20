import { createMuiTheme, CssBaseline, ThemeProvider } from "@material-ui/core";

type Props = {
  children: React.ReactNode;
};

export const StylesProvider = ({ children }: Props) => {
  const theme = createMuiTheme({
    palette: {
      primary: {
        light: "#76a8d3",
        main: "#4479a2",
        dark: "#034d73",
      },
      secondary: {
        light: "#b6bec7",
        main: "#868e96",
        dark: "#596168",
      },
      grey: {
        100: "#f2f2f2",
        200: "#e9ecef",
        300: "#dee2e6",
        400: "#ced4da",
        500: "#adb5bd",
        600: "#868e96",
        700: "#495057",
        800: "#343a40",
        900: "#212529",
      },
      background: {
        default: "#f2f2f2",
        paper: "#f2f2f2",
      },
    },
  });
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {children}
    </ThemeProvider>
  );
};
