import React from "react";
import { useTheme, useMediaQuery } from "@material-ui/core";
import { TemporaryNavigation } from "./TemporaryNavigation";
import { PermanentNavigation } from "./PermanentNavigation";

type Props = {
  children: React.ReactNode;
  isNavigationOpen: boolean;
  handleNavigationToggle: () => void;
};

export const NavigationContainer = ({
  isNavigationOpen,
  handleNavigationToggle,
  children,
}: Props) => {
  const theme = useTheme();
  const matches = useMediaQuery(theme.breakpoints.down("sm"));
  const navigation = matches ? (
    <TemporaryNavigation
      isNavigationOpen={isNavigationOpen}
      handleNavigationToggle={handleNavigationToggle}
    >
      {children}
    </TemporaryNavigation>
  ) : (
    <PermanentNavigation>{children}</PermanentNavigation>
  );

  return <> {navigation} </>;
};
