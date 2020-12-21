import { useAuth } from "../../auth";
import { LinkList, NavigationElement } from "./LinkList";
import { NavigationContainer } from "./NavigationContainer";

const navList: NavigationElement[] = [
  {
    text: "Start page",
    path: "/welcome",
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
  const { isSignedIn } = useAuth();
  return isSignedIn ? (
    <NavigationContainer>
      <LinkList navigationElements={navList} />
    </NavigationContainer>
  ) : null;
};
