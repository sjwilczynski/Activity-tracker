import { List, ListItem, ListItemText } from "@mui/material";
import makeStyles from "@mui/styles/makeStyles";
import { useMemo, forwardRef, useCallback } from "react";
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
  const styles = useStyles();
  const ListLink = useMemo(
    () =>
      forwardRef<any, Omit<NavLinkWrapperProps, "to">>((itemProps, ref) => (
        <NavLinkWrapper to={path} {...itemProps} />
      )),
    [path]
  );
  const toggleNavigation = useNavigationToggle();
  return (
    <ListItem
      className={styles.link}
      activeClassName={styles.activeLink}
      component={ListLink}
      onClick={toggleNavigation}
    >
      <ListItemText primary={text} />
    </ListItem>
  );
};

const useStyles = makeStyles((theme) => ({
  link: {
    textAlign: "center",
    color: theme.palette.secondary.light,
  },
  activeLink: {
    color: theme.palette.common.white,
  },
}));

type NavLinkWrapperProps = Omit<NavLinkProps, "className"> & {
  className: string;
  activeClassName: string;
};

const NavLinkWrapper = ({
  className,
  activeClassName,
  ...rest
}: NavLinkWrapperProps) => {
  const getClassName = useCallback(
    ({ isActive }) => `${className} ${isActive ? activeClassName : ""}`,
    [className, activeClassName]
  );
  return <NavLink {...rest} className={getClassName} />;
};
