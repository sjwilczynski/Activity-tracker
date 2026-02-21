import { cert, initializeApp, type ServiceAccount } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getDatabase } from "firebase-admin/database";
import config from "./firebaseConfig.json" with { type: "json" };
import type { AdminConfig } from "./types";

const getServiceAccount = (config: AdminConfig): ServiceAccount => ({
  clientEmail: config.client_email,
  privateKey: config.private_key,
  projectId: config.project_id,
});

initializeApp({
  credential: cert(getServiceAccount(config)),
  databaseURL: process.env.databaseURL,
  databaseAuthVariableOverride: {
    uid: process.env.serviceWorkerId,
  },
});

export const auth = getAuth();
export const database = getDatabase();
