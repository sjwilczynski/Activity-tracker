import { Navigate, Route, Routes } from "react-router-dom";
import { useActivitiesPrefetch } from "../data";
import { ActivityList } from "./ActivityList";
import { Charts } from "./Charts";
import { PagesContainer } from "./PagesContainer";
import { Profile } from "./Profile";
import { Welcome } from "./Welcome";

export const Pages = () => {
  useActivitiesPrefetch();
  return (
    <PagesContainer>
      <Routes>
        <Route path="/welcome" element={<Welcome />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/charts" element={<Charts />} />
        <Route path="/activity-list" element={<ActivityList />} />
        <Route path="/" element={<Navigate to="/welcome" />}></Route>
      </Routes>
    </PagesContainer>
  );
};
