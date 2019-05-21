/*
    Purpose: setup KnexJS with environment-specific configuration
*/

const knex = require("knex");
const environment = process.env.NODE_ENV || "development";
const config = require("../../knexfile");

exports.db = knex(config[environment]);

// expose a TABLES object; holds string name values of the tables
// we're interacting with.

// fill this in as we build out the tables
// probably we're going to need
// • contacts (form submission)
// • users (for admin back-end)
// • employers (for employer picklist, linked to salesforce)
// • images (for form intro content)
// • text (for form headlines and body copy)
exports.TABLES = {
  CONTACTS: "contacts",
  USERS: "users"
};
