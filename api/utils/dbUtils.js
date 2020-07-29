const firebase = require("firebase/app");
require("firebase/database");
const firebaseConfig = require("./firebase-config.json");

function initDB() {
  const app = firebase.initializeApp(firebaseConfig);
  const db = firebase.database(app);
  return db;
}

function getActivities(db) {
  return db.ref("/activities").once("value");
}

function addActivity(db, activity) {
  const activitiesRef = db.ref("/activities");
  return activitiesRef.push(activity);
}

module.exports = {
  initDB,
  addActivity,
  getActivities,
};
