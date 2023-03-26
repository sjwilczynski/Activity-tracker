import * as admin from "firebase-admin";
import type { AdminConfig } from "./types";
import fs from "fs";
import path from "path";

const getServiceAccount = (config: AdminConfig): admin.ServiceAccount => ({
  clientEmail: config.client_email,
  privateKey: config.private_key,
  projectId: config.project_id,
});

const pathToConfig = path.join(__dirname, "./firebaseConfig.json");

const config = JSON.parse(
  fs.readFileSync(pathToConfig, { encoding: "utf-8" })
) as AdminConfig;

admin.initializeApp({
  credential: admin.credential.cert(getServiceAccount(config)),
  databaseURL: process.env.databaseURL,
  databaseAuthVariableOverride: {
    uid: process.env.serviceWorkerId,
  },
});

export default admin;
export const database = admin.database();
