import { describe, expect, it, vi } from "vitest";
import type { AuthAdapter } from "../auth/types";
import { createSession } from "./session";
import { createTestAuth, testUser } from "./test-auth";

describe("authenticated session lifetime", () => {
  it("rejects a pending token when the account changes", async () => {
    let user = { uid: "alice", displayName: null, email: null, photoURL: null };
    let resolveToken!: (token: string) => void;
    const auth: AuthAdapter = {
      getUser: () => user,
      waitForAuth: async () => {},
      onAuthStateChanged: () => () => {},
      getIdToken: () =>
        new Promise((resolve) => {
          resolveToken = resolve;
        }),
      signOut: async () => {},
      signInWithGoogle: async () => {},
      signInWithEmail: async () => {},
      signUp: async () => {},
    };
    const session = createSession(auth);
    const token = session.getAuthToken();
    user = { ...user, uid: "bob" };
    resolveToken("alice-token");
    await expect(token).rejects.toThrow("Session retired");
    session.dispose();
  });

  it("does not ask for another account's token when old work resumes after retirement", async () => {
    const { auth, setUser } = createTestAuth();
    const readToken = vi.spyOn(auth, "getIdToken");
    const alice = createSession(auth);
    let resume!: () => void;
    const gate = new Promise<void>((resolve) => {
      resume = resolve;
    });
    const mutation = alice.queryClient
      .getMutationCache()
      .build(alice.queryClient, {
        mutationFn: async () => {
          await gate;
          return alice.getAuthToken();
        },
      });
    const pending = mutation.execute(undefined);
    setUser({ ...testUser, uid: "bob" });
    alice.dispose();
    const bob = createSession(auth);
    resume();
    await expect(pending).rejects.toThrow("Session retired");
    expect(readToken).not.toHaveBeenCalled();
    expect(bob.queryClient.getMutationCache().getAll()).toHaveLength(0);
    bob.dispose();
  });

  it("cancels a retired read so a late response cannot populate the next account", async () => {
    const { auth, setUser } = createTestAuth();
    const alice = createSession(auth);
    let respond!: (value: string[]) => void;
    const pending = alice.queryClient.query({
      queryKey: ["activities"],
      queryFn: () =>
        new Promise<string[]>((resolve) => {
          respond = resolve;
        }),
    });
    const rejected = expect(pending).rejects.toThrow();
    setUser({ ...testUser, uid: "bob" });
    alice.dispose();
    const bob = createSession(auth);
    respond(["Alice's private history"]);
    await rejected;
    expect(alice.queryClient.getQueryData(["activities"])).toBeUndefined();
    expect(bob.queryClient.getQueryData(["activities"])).toBeUndefined();
    bob.dispose();
  });
});
