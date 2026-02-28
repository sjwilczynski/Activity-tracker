import React from "react";
import ReactDOM from "react-dom/client";
import { HydratedRouter } from "react-router/dom";
import { enableMockAuth } from "../mocks/mockAuth";

enableMockAuth();
// Signal that mock auth is active — API mocking is handled by Playwright's page.route()
document.documentElement.dataset.mswReady = "true";

ReactDOM.hydrateRoot(
  document,
  <React.StrictMode>
    <HydratedRouter />
  </React.StrictMode>
);
