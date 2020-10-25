import * as React from "react";
import { LinkList, NavigationElement } from "./LinkList";
import { NavigationContainer } from "./NavigationContainer";

type Props = {
  isNavigationOpen: boolean;
  handleNavigationToggle: () => void;
};

const navList: NavigationElement[] = [
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
  return (
    <NavigationContainer
      handleNavigationToggle={handleNavigationToggle}
      isNavigationOpen={isNavigationOpen}
    >
      <LinkList
        navigationElements={navList}
        handleNavigationToggle={handleNavigationToggle}
      />
    </NavigationContainer>
  );
};
