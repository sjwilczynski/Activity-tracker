import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { SessionHost } from "./app/SessionHost";
import { authService } from "./auth/authService";
import "./app/globals.css";

const root = document.getElementById("root");
if (!root) throw new Error("Application root is missing");
createRoot(root).render(
  <StrictMode>
    <SessionHost auth={authService} />
  </StrictMode>
);
