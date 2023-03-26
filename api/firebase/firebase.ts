import * as admin from "firebase-admin";
import type { AdminConfig } from "./types";

const getServiceAccount = (config: AdminConfig): admin.ServiceAccount => ({
  clientEmail: config.client_email,
  privateKey: config.private_key,
  projectId: config.project_id,
});

// eslint-disable-next-line @typescript-eslint/no-var-requires
const config = require("./firebaseConfig.json") as AdminConfig;

admin.initializeApp({
  credential: admin.credential.cert(getServiceAccount(config)),
  databaseURL: process.env.databaseURL,
  databaseAuthVariableOverride: {
    uid: process.env.serviceWorkerId,
  },
});

export default admin;
export const database = admin.database();
