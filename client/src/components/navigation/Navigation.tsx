import { List, ListItem, ListItemText } from "@material-ui/core";
import * as React from "react";
import { NavLink, NavLinkProps } from "react-router-dom";
import { PermanentDrawer } from "../PermanentDrawer";

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

export const Navigation = () => {
  const navigation = (
    <nav>
      <List>
        {navList.map((item) => {
          return <Link {...item} />;
        })}
      </List>
    </nav>
  );
  return <PermanentDrawer>{navigation}</PermanentDrawer>;
};

const Link = ({ text, path }: { text: string; path: string }) => {
  const ListLink = (props: Omit<NavLinkProps, "to">) => (
    <NavLink to={path} {...props} />
  );
  return (
    <ListItem key={text} component={ListLink}>
      <ListItemText primary={text} />
    </ListItem>
  );
};
