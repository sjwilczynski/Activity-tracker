import * as firebase from "firebase";
import { ActivityRecord, DatabaseConfig } from "./types";

function getDatabaseConfig(env: { [key: string]: string }): DatabaseConfig {
  return {
    apiKey: env["apiKey"],
    authDomain: env["authDomain"],
    databaseURL: env["databaseURL"],
    projectId: env["projectId"],
    storageBucket: env["storageBucket"],
    messagingSenderId: env["messagingSenderId"],
    appId: env["appId"],
    measurementId: env["measurementId"],
  };
}

function initDB(firebaseConfig: DatabaseConfig) {
  const app = firebase.initializeApp(firebaseConfig);
  const db = firebase.database(app);
  return db;
}

export const database = initDB(getDatabaseConfig(process.env));

export async function getActivities() {
  return database.ref("/activities").once("value");
}

export async function addActivity(activity: ActivityRecord) {
  const activitiesRef = database.ref("/activities");
  return activitiesRef.push(activity);
}
