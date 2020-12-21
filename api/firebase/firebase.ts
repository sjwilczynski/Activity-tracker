import * as admin from "firebase-admin";
import config from "./firebaseConfig.json";
import { AdminConfig } from "./types";

const getServiceAccount = (config: AdminConfig): admin.ServiceAccount => ({
  clientEmail: config.client_email,
  privateKey: config.private_key,
  projectId: config.project_id,
});

admin.initializeApp({
  credential: admin.credential.cert(getServiceAccount(config)),
  databaseURL: process.env.databaseURL,
  databaseAuthVariableOverride: {
    uid: process.env.serviceWorkerId,
  },
});

export default admin;
export const database = admin.database();
