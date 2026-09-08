import {
  createBrowserHistory,
  type RouterHistory,
} from "@tanstack/react-router";
import type { User } from "../auth/AuthContext";
import type { AuthAdapter } from "../auth/types";
import { createAppRouter, type AppRouter } from "./router";
import { createSession } from "./session";

type Runtime = { session: ReturnType<typeof createSession>; router: AppRouter };
type Snapshot = {
  generation: number;
  runtime: Runtime | null;
  user: User | null;
  error: Error | null;
};

export function createSessionHost(auth: AuthAdapter, history?: RouterHistory) {
  let activeHistory = history;
  let snapshot: Snapshot = {
    generation: 0,
    runtime: null,
    user: null,
    error: null,
  };
  const listeners = new Set<() => void>();
  const emit = () => {
    for (const listener of listeners) listener();
  };
  const retire = () => {
    snapshot.runtime?.session.dispose();
    snapshot.runtime?.router.clearCache();
  };
  const update = () => {
    const user = auth.getUser();
    if (
      snapshot.runtime &&
      (snapshot.user?.uid ?? null) === (user?.uid ?? null)
    ) {
      snapshot = { ...snapshot, user };
      emit();
      return;
    }
    retire();
    const session = createSession(auth);
    const router = createAppRouter(
      {
        queryClient: session.queryClient,
        authService: session.authService,
        getAuthToken: session.getAuthToken,
      },
      activeHistory
    );
    snapshot = {
      generation: snapshot.generation + 1,
      runtime: { session, router },
      user,
      error: null,
    };
    emit();
  };
  return {
    getSnapshot: () => snapshot,
    subscribe: (listener: () => void) => {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
    start() {
      activeHistory = history ?? createBrowserHistory();
      let active = true;
      let ready = false;
      const unsubscribe = auth.onAuthStateChanged(() => {
        if (active && ready) update();
      });
      void auth.waitForAuth().then(
        () => {
          if (!active) return;
          ready = true;
          update();
        },
        (error: unknown) => {
          if (!active) return;
          snapshot = {
            ...snapshot,
            error:
              error instanceof Error
                ? error
                : new Error("Authentication initialization failed"),
          };
          emit();
        }
      );
      return () => {
        active = false;
        unsubscribe();
        retire();
        if (!history) activeHistory?.destroy();
        snapshot = {
          generation: snapshot.generation + 1,
          runtime: null,
          user: null,
          error: null,
        };
        emit();
      };
    },
  };
}
