"use strict";

// set up ======================================================================
const express = require("express");
const app = express();
const middleware = require("./middleware");
app.use(middleware);
app.set("trust proxy", true);
const favicon = require("serve-favicon");
const dotenv = require("dotenv").config();
const path = require("path");

// connect to db

const pg = require("pg");
const configDB = require("./app/config/knex");
const client = new pg.Client(configDB.configConnection);
client.connect(err => {
  if (err) {
    return console.error("could not connect to postgres", err);
  }
  client.query('SELECT NOW() AS "theTime"', function(err, result) {
    if (err) {
      return console.error("error running query", err);
    }
    console.log(`DATABASE CONNECTION CHECK: ${result.rows[0].theTime}`);
    // >> output: 2018-08-23T14:02:57.117Z
    // client.end();
  });
});

// routes ======================================================================
const apiRoutes = require("./app/routes/apiRoutes");
const staticRoutes = require("./app/routes/staticRoutes");

// set static path
if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "/client/build/")));
}

/* ================================ ROUTES ================================= */

app.use("/api", apiRoutes);
app.use("/", staticRoutes);

// launch ======================================================================
var port = 8080;
if (!module.parent) {
  app.listen(port, function() {
    console.log("Node.js listening on port " + port + "...");
    console.log(
      `################## 20240223 server.js > NODE_CONFIG_ENV: ${process.env.NODE_CONFIG_ENV}`
    );
  });
}

module.exports = app;
