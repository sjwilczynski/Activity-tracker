import { useTheme, useMediaQuery } from "@mui/material";
import { TemporaryNavigation } from "./TemporaryNavigation";
import { PermanentNavigation } from "./PermanentNavigation";

type Props = {
  children: React.ReactNode;
};

export const NavigationContainer = ({ children }: Props) => {
  const theme = useTheme();
  const matches = useMediaQuery(theme.breakpoints.down("md"));
  const navigation = matches ? (
    <TemporaryNavigation>{children}</TemporaryNavigation>
  ) : (
    <PermanentNavigation>{children}</PermanentNavigation>
  );

  return <> {navigation} </>;
};
