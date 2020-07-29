const express = require("express");
const dbUtils = require("./utils/dbUtils");
const moment = require("moment");

function addActivityRouter(db) {
  const router = express.Router();
  router.post("/", function (req, res) {
    const activity = req.body.activity;
    if (isActivityValid(activity)) {
      dbUtils
        .addActivity(db, activity)
        .then(() => res.sendStatus(200))
        .catch((err) => res.status(500).send(`Error ${err}`));
    } else {
      res.status(500).send("Activity is not valid");
    }
  });
  return router;
}

function isActivityValid(activity) {
  if (!activity || !activity.date || !activity.activity) {
    return false;
  }

  if (!moment(activity.date, "YYYY-MM-DD", true).isValid()) {
    return false;
  }

  const { name, active } = activity.activity;
  if (!isValidName(name) || typeof active !== "boolean") {
    return false;
  }

  return true;
}

function isValidName(name) {
  return Boolean(name);
}

module.exports = addActivityRouter;
