import { List, ListItem, ListItemText, makeStyles } from "@material-ui/core";
import * as React from "react";
import { NavLink, NavLinkProps } from "react-router-dom";

export type NavigationElement = {
  text: string;
  path: string;
};

type Props = {
  navigationElements: NavigationElement[];
  handleNavigationToggle: () => void;
};

export const LinkList = ({
  navigationElements,
  handleNavigationToggle,
}: Props) => {
  return (
    <List>
      {navigationElements.map((item) => {
        return (
          <Link
            key={item.text}
            navigationElement={item}
            handleNavigationToggle={handleNavigationToggle}
          />
        );
      })}
    </List>
  );
};

const Link = ({
  navigationElement,
  handleNavigationToggle,
}: {
  navigationElement: NavigationElement;
  handleNavigationToggle: () => void;
}) => {
  const { text, path } = navigationElement;
  const styles = useStyles();
  const ListLink = React.useMemo(
    () =>
      React.forwardRef<any, Omit<NavLinkProps, "to">>((itemProps, ref) => (
        <NavLink to={path} ref={ref} {...itemProps} exact />
      )),
    [path]
  );
  return (
    <ListItem
      className={styles.link}
      activeClassName={styles.activeLink}
      component={ListLink}
      onClick={handleNavigationToggle}
    >
      <ListItemText primary={text} />
    </ListItem>
  );
};

const useStyles = makeStyles((theme) => {
  return {
    link: {
      textAlign: "center",
      color: theme.palette.secondary.light,
    },
    activeLink: {
      color: theme.palette.common.white,
    },
  };
});
