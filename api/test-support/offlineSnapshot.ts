import { deleteApp, initializeApp } from "firebase-admin/app";
import { getDatabase } from "firebase-admin/database";
import { randomUUID } from "node:crypto";
import { afterAll } from "vitest";

const app = initializeApp(
  {
    databaseURL: "https://demo-activity-tracker.firebaseio.com",
    credential: {
      getAccessToken: async () => ({
        access_token: "owner",
        expires_in: 3600,
      }),
    },
  },
  `offline-fixtures-${randomUUID()}`
);
const database = getDatabase(app);
database.goOffline();
afterAll(() => deleteApp(app));
let nextId = 0;

/** Real SDK serialization, without a server or production credentials. */
export async function offlineSnapshot(value: unknown) {
  const ref = database.ref(`fixtures/${nextId++}`);
  // Offline writes update the local cache synchronously but cannot acknowledge.
  void ref.set(value);
  return ref.once("value");
}
