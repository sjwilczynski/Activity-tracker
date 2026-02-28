import React from "react";
import ReactDOM from "react-dom/client";
import { HydratedRouter } from "react-router/dom";
import { worker } from "../mocks/browser";
import { enableMockAuth } from "../mocks/mockAuth";

async function boot() {
  enableMockAuth();
  await worker.start({ onUnhandledRequest: "bypass" });
  // Signal that MSW is intercepting requests before React renders
  document.documentElement.dataset.mswReady = "true";

  ReactDOM.hydrateRoot(
    document,
    <React.StrictMode>
      <HydratedRouter />
    </React.StrictMode>
  );
}

boot();
