/*
    Purpose: setup KnexJS with environment-specific configuration
*/

const knex = require("knex");
const environment = process.env.NODE_CONFIG_ENV || "development";
console.log(`knex environment: ${environment}`);
const config = require("../../knexfile");
exports.configConnection = config[environment].connection;

exports.db = knex(config[environment]);

// expose a TABLES object; holds string name values of the tables
// we're interacting with.

exports.TABLES = {
  USERS: "users",
  CONTACTS: "contacts",
  SUBMISSIONS: "submissions",
  CONTENT: "content",
  CAPE: "cape"
};
