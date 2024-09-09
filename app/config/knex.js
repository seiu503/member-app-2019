/*
    Purpose: setup KnexJS with environment-specific configuration
*/

const knex = require("knex");
const environment = process.env.NODE_CONFIG_ENV || "development";
console.log(`knex environment: ${environment}`);
if (environment === "staging") {
  process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = 0;
}
console.log("@@@ CHECKING TLS REJECT SETTINGS @@@");
console.log(
  `process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = ${process.env["NODE_TLS_REJECT_UNAUTHORIZED"]}`
);

const config = require("../../knexfile");
// console.log(config[environment]);
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
