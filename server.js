const express = require("express");
const path = require("path");
const app = express();
const bodyParser = require("body-parser");


const makeGetActivitiesRouter = require("./api/getActivities");
const makeAddActivityRouter = require("./api/addActivity");
const dbUtils = require("./api/utils/dbUtils");

const db = dbUtils.initDB();
const getActivitiesRouter = makeGetActivitiesRouter(db);
const addActivityRouter = makeAddActivityRouter(db);

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Serve the static files from the React app
app.use(express.static(path.join(__dirname, "client/build")));
app.use("/api/getActivities", getActivitiesRouter);
app.use("/api/addActivity", addActivityRouter);

// Handles any requests that don't match the ones above
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "client/build/index.html"));
});

const port = process.env.PORT || 5000;
app.listen(port);
