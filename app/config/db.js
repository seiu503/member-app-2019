"use strict";

module.exports = {
  url: process.env.DATABASE_URL
  // options: {
  // keepAlive: 1,
  // connectTimeoutMS: 30000,
  // reconnectTries: Number.MAX_VALUE,
  // reconnectInterval: 1000,
  // useNewUrlParser: true
  // }
};

const pg = require("knex")({
  client: "pg",
  connection: process.env.DATABASE_URL,
  searchPath: ["knex", "public"]
});
