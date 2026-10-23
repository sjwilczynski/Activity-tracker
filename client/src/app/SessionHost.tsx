import type { RouterHistory } from "@tanstack/react-router";
import { useEffect, useState, useSyncExternalStore } from "react";
import type { AuthAdapter } from "../auth/types";
import { HydrateFallback } from "../components/states/HydrateFallback";
import { RouterView } from "./router";
import { createSessionHost } from "./session-host";

export function SessionHost({
  auth,
  history,
}: {
  auth: AuthAdapter;
  history?: RouterHistory;
}) {
  const [host] = useState(() => createSessionHost(auth, history));
  const snapshot = useSyncExternalStore(host.subscribe, host.getSnapshot);
  useEffect(() => host.start(), [host]);
  if (snapshot.error) return <div role="alert">{snapshot.error.message}</div>;
  if (!snapshot.runtime) return <HydrateFallback />;
  return (
    <RouterView
      key={snapshot.generation}
      router={snapshot.runtime.router}
      user={snapshot.user}
    />
  );
}
