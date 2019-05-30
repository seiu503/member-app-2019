/*
    Purpose: setup KnexJS with environment-specific configuration
*/

const knex = require("knex");
const environment = process.env.NODE_ENV || "development";
const config = require("../../knexfile");

exports.db = knex(config[environment]);

// expose a TABLES object; holds string name values of the tables
// we're interacting with.

// fill this in as we build out the tables. still missing:
// • employers (for employer picklist. needs name, SF Acct ID, Agency Number)
// • payments (for unioni.se payment processing. data structure is WIP)

exports.TABLES = {
  USERS: "users",
  CONTACTS: "contacts",
  SUBMISSIONS: "submissions",
  CONTACTS_SUBMISSIONS: "contacts_submissions",
  FORM_META: "form_meta"
};
