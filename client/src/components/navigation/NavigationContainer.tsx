import { useTheme, useMediaQuery } from "@material-ui/core";
import { TemporaryNavigation } from "./TemporaryNavigation";
import { PermanentNavigation } from "./PermanentNavigation";

type Props = {
  children: React.ReactNode;
};

export const NavigationContainer = ({ children }: Props) => {
  const theme = useTheme();
  const matches = useMediaQuery(theme.breakpoints.down("sm"));
  const navigation = matches ? (
    <TemporaryNavigation>{children}</TemporaryNavigation>
  ) : (
    <PermanentNavigation>{children}</PermanentNavigation>
  );

  return <> {navigation} </>;
};
