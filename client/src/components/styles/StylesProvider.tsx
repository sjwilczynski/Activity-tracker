import {
  createMuiTheme,
  CssBaseline,
  ThemeOptions,
  ThemeProvider,
} from "@material-ui/core";
import { atom, useAtom } from "jotai";
import { useAtomValue } from "jotai/utils";

type Props = {
  children: React.ReactNode;
};

const themeOverrides = {
  overrides: {
    MuiTooltip: {
      tooltip: {
        fontSize: "0.75rem",
      },
    },
  },
};

const lightTheme: ThemeOptions = {
  palette: {
    type: "light",
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
    info: {
      light: "#76a8d3",
      main: "#4479a2",
      dark: "#034d73",
    },
  },
  ...themeOverrides,
};

const darkTheme: ThemeOptions = {
  palette: {
    type: "dark",
    primary: {
      light: "#666666",
      main: "#424242",
      dark: "#000000",
    },
    secondary: {
      light: "#b6bec7",
      main: "#868e96",
      dark: "#596168",
    },
    info: {
      light: "#76a8d3",
      main: "#4479a2",
      dark: "#034d73",
    },
  },
  ...themeOverrides,
};

const isLightThemeAtom = atom(true);
const themeAtom = atom(
  (get) => get(isLightThemeAtom),
  (get, set) => set(isLightThemeAtom, !get(isLightThemeAtom))
);
export const useIsLightTheme = () => useAtomValue(themeAtom);
export const useThemeState = () => useAtom(themeAtom);

export const StylesProvider = ({ children }: Props) => {
  const isLightTheme = useIsLightTheme();
  const theme = createMuiTheme(isLightTheme ? lightTheme : darkTheme);
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {children}
    </ThemeProvider>
  );
};
