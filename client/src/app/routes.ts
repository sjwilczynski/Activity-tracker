import {
  index,
  layout,
  route,
  type RouteConfig,
} from "@react-router/dev/routes";

export default [
  // Login route is outside the layout (public)
  route("login", "routes/login.tsx"),
  // Protected routes inside the layout
  layout("routes/_layout.tsx", [
    index("routes/_index.tsx"),
    route("welcome", "routes/welcome.tsx"),
    route("settings", "routes/settings.tsx"),
    route("charts", "routes/charts.tsx"),
    route("activity-list", "routes/activity-list.tsx"),
  ]),
] satisfies RouteConfig;
