const express = require("express");
const dbUtils = require("./utils/dbUtils");

function getActivitiesRouter(db) {
  const router = express.Router();
  router.get("/", function (req, res) {
    dbUtils.getActivities(db).then((data) => res.json(data.val()));
  });
  return router;
}

module.exports = getActivitiesRouter;
