import { List, ListItem, ListItemText, useTheme } from "@mui/material";
import { forwardRef, useCallback, useMemo } from "react";
import { NavLink, NavLinkProps } from "react-router-dom";
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
  const ListLink = useMemo(
    () =>
      forwardRef<any, Omit<NavLinkProps, "to">>((itemProps, ref) => (
        <NavLinkWrapper to={path} ref={ref} {...itemProps} />
      )),
    [path]
  );
  const toggleNavigation = useNavigationToggle();
  return (
    <ListItem component={ListLink} onClick={toggleNavigation}>
      <ListItemText primary={text} />
    </ListItem>
  );
};

const NavLinkWrapper = forwardRef<any, NavLinkProps>(
  (props: NavLinkProps, ref) => {
    const theme = useTheme();
    const style: NavLinkProps["style"] = useCallback(
      ({ isActive }) => {
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
