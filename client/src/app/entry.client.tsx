import React from "react";
import ReactDOM from "react-dom/client";
import { HydratedRouter } from "react-router/dom";

async function boot() {
  // Start MSW browser worker when ?msw=true (for E2E tests)
  if (new URLSearchParams(window.location.search).has("msw")) {
    const { worker } = await import("../mocks/browser");
    const { enableMockAuth } = await import("../mocks/mockAuth");
    enableMockAuth();
    await worker.start({ onUnhandledRequest: "bypass" });
  }

  ReactDOM.hydrateRoot(
    document,
    <React.StrictMode>
      <HydratedRouter />
    </React.StrictMode>
  );
}

boot();
