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
// • contacts (people who submit forms. fields in google doc)
// • users (for admin back-end)
// • employers (for employer picklist. needs name, SF Acct ID, Agency Number)
// • submissions (one contact => many submissions. fields in google doc)
// • images (for form intro content => image url, title, alt text)
// • text (for form headlines and body copy)
exports.TABLES = {
  // CONTACTS: "contacts",
  USERS: "users"
};
