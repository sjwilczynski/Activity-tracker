import * as React from "react";
import { Link } from "react-router-dom";

export const Navigation = () => {
  return (
    <div>
      <Link to="/">Start page</Link>
      <Link to="/profile">Profile</Link>
      <Link to="/charts">Charts</Link>
      <Link to="/activity-list">Activity list</Link>
    </div>
  );
};
