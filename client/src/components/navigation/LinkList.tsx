import { List, ListItem, ListItemText, useTheme } from "@mui/material";
import { forwardRef, useCallback, useMemo } from "react";
import type { NavLinkProps } from "react-router-dom";
import { NavLink, useLocation } from "react-router-dom";
import { useNavigationToggle } from "./useNavigationState";

export type NavigationElement = {
  text: string;
  path: string;
};

type Props = {
  navigationElements: NavigationElement[];
};

export const LinkList = ({ navigationElements }: Props) => {
  return (
    <List>
      {navigationElements.map((item) => (
        <Link key={item.text} navigationElement={item} />
      ))}
    </List>
  );
};

const Link = ({
  navigationElement,
}: {
  navigationElement: NavigationElement;
}) => {
  const { text, path } = navigationElement;
  const location = useLocation();

  const ListLink = useMemo(
    () =>
      forwardRef<unknown, Omit<NavLinkProps, "to">>((itemProps, ref) => (
        <NavLinkWrapper
          to={{ pathname: path, search: location.search }}
          ref={ref}
          {...itemProps}
        />
      )),
    [path, location.search]
  );
  const toggleNavigation = useNavigationToggle();
  return (
    <ListItem component={ListLink} onClick={toggleNavigation}>
      <ListItemText primary={text} />
    </ListItem>
  );
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const NavLinkWrapper = forwardRef<any, NavLinkProps>(
  (props: NavLinkProps, ref) => {
    const theme = useTheme();
    const style: NavLinkProps["style"] = useCallback(
      ({ isActive }: { isActive: boolean }) => {
        return isActive
          ? ({
              textAlign: "center",
              color: theme.palette.common.white,
            } as const)
          : ({
              textAlign: "center",
              color: theme.palette.secondary.light,
            } as const);
      },
      [theme]
    );

    return <NavLink ref={ref} {...props} style={style} />;
  }
);
