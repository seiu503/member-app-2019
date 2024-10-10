"use strict";

// set up ======================================================================
import express from "express";
const app = express();
import middleware from "./middleware.js";
app.use(middleware);
app.set("trust proxy", true);
import favicon from "serve-favicon";
import dotenv from "dotenv";
dotenv.config();
import path from "path";

// connect to db

import pg from "pg";
import knexConfig from "./app/config/knexConfig.js";
const client = new pg.Client(knexConfig.configConnection);
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
import apiRoutes from "./app/routes/apiRoutes.js";
import staticRoutes from "./app/routes/staticRoutes.js";

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

export default app;
