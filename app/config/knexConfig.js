/*
    Purpose: setup KnexJS with environment-specific configuration
*/

import knex from "knex";
const environment = process.env.NODE_CONFIG_ENV || "development";
console.log(`knex environment: ${environment}`);
if (environment === "staging") {
  process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = 0;
}
console.log("@@@ CHECKING TLS REJECT SETTINGS @@@");
console.log(
  `process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = ${process.env["NODE_TLS_REJECT_UNAUTHORIZED"]}`
);

import config from "../../knexfile.js";
// console.log(config[environment]);
export const configConnection = config[environment].connection;

export const db = knex(config[environment]);

// expose a TABLES object; holds string name values of the tables
// we're interacting with.

export const TABLES = {
  USERS: "users",
  CONTACTS: "contacts",
  SUBMISSIONS: "submissions",
  CONTENT: "content",
  CAPE: "cape"
};


export const knexConfig = {
  configConnection: config[environment].connection,
  db: knex(config[environment]),
  TABLES: {
    USERS: "users",
    CONTACTS: "contacts",
    SUBMISSIONS: "submissions",
    CONTENT: "content",
    CAPE: "cape"
  }
}