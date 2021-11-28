import {
  createTheme,
  CssBaseline,
  DeprecatedThemeOptions,
  ThemeProvider,
  Theme,
  StyledEngineProvider,
  adaptV4Theme,
} from "@mui/material";
import { atom, useAtom } from "jotai";
import { useAtomValue } from "jotai/utils";

declare module "@mui/styles/defaultTheme" {
  // eslint-disable-next-line @typescript-eslint/no-empty-interface
  interface DefaultTheme extends Theme {}
}

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

const lightTheme: DeprecatedThemeOptions = {
  palette: {
    mode: "light",
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

const darkTheme: DeprecatedThemeOptions = {
  palette: {
    mode: "dark",
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
    background: {
      default: "#303030",
      paper: "#303030",
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
  const theme = createTheme(
    adaptV4Theme(isLightTheme ? lightTheme : darkTheme)
  );
  return (
    <StyledEngineProvider injectFirst>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </StyledEngineProvider>
  );
};
