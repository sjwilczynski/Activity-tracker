import React from "react";
import ReactDOM from "react-dom/client";
import { HydratedRouter } from "react-router/dom";
import { enableMockAuth } from "../mocks/mockAuth";

// Bypass Firebase auth — API mocking is handled by Playwright's page.route()
enableMockAuth();

ReactDOM.hydrateRoot(
  document,
  <React.StrictMode>
    <HydratedRouter />
  </React.StrictMode>
);
