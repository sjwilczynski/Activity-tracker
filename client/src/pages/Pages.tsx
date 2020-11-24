import { Route, Switch } from "react-router-dom";
import { ActivityList } from "./ActivityList";
import { Charts } from "./Charts";
import { PageNotFound } from "./PageNotFound";
import { PagesContainer } from "./PagesContainer";
import { Profile } from "./Profile";
import { Welcome } from "./Welcome";

export const Pages = () => {
  return (
    <PagesContainer>
      <Switch>
        <Route exact path="/" component={Welcome} />
        <Route exact path="/profile" component={Profile} />
        <Route exact path="/charts" component={Charts} />
        <Route exact path="/activity-list" component={ActivityList} />
        <Route path="/" component={PageNotFound} />
      </Switch>
    </PagesContainer>
  );
};
