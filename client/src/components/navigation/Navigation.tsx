import { List, ListItem, ListItemText } from "@material-ui/core";
import * as React from "react";
import { NavLink, NavLinkProps } from "react-router-dom";
import { NavigationContainer } from "./NavigationContainer";

type Props = {
  isNavigationOpen: boolean;
  handleNavigationToggle: () => void;
};

const navList = [
  {
    text: "Start page",
    path: "/",
  },
  {
    text: "Profile",
    path: "/profile",
  },
  {
    text: "Charts",
    path: "/charts",
  },
  {
    text: "Activity list",
    path: "/activity-list",
  },
];

export const Navigation = ({
  isNavigationOpen,
  handleNavigationToggle,
}: Props) => {
  const navigation = (
    <List>
      {navList.map((item) => {
        return <Link key={item.text} {...item} />;
      })}
    </List>
  );
  return (
    <NavigationContainer
      handleNavigationToggle={handleNavigationToggle}
      isNavigationOpen={isNavigationOpen}
    >
      {navigation}
    </NavigationContainer>
  );
};

const Link = ({ text, path }: { text: string; path: string }) => {
  const ListLink = React.useMemo(
    () =>
      React.forwardRef<any, Omit<NavLinkProps, "to">>((itemProps, ref) => (
        <NavLink to={path} ref={ref} {...itemProps} />
      )),
    [path]
  );
  return (
    <ListItem component={ListLink}>
      <ListItemText primary={text} />
    </ListItem>
  );
};
