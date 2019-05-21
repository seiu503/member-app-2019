// db/models/users.js

/* ================================= SETUP ================================= */

const uuid = require("uuid");
const { db, TABLES } = require("../../app/config/knex");

/* ============================ PUBLIC METHODS ============================= */

/** Create a user
 *  @param    {String}   username       New user username.
 *  @param    {String}   email          New user email.
 *  @param    {String}   github_id      New user github id.
 *  @param    {String}   github_token   New user github token.
 *  @returns  {Array}    Array of 1 newly-created User object.
 */
const createUser = (username, email, github_id, github_token) => {
  return db
    .insert({ id: uuid.v4(), username, email, github_id, github_token })
    .into(TABLES.USERS)
    .returning("*");
};

/** Update a user
 *  @param    {String}   id             The id of the user to update.
 *  @param    {Object}   updates        Key/value pairs of fields to update.
 ****  @param    {String}   username        Updated username.
 ****  @param    {String}   email           Updated email.
 *  @returns  {Object}        User object.
 */
const updateUser = (id, updates) => {
  return db(TABLES.USERS)
    .where({ id })
    .first()
    .update(updates)
    .update("updated_at", db.fn.now())
    .returning("*");
};

/** Get all users
 *  @returns   {Array}   Array of user objects.
 */

const getUsers = () => {
  return db(TABLES.USERS).returning("*");
};

/** Find a user by id
 *  @param    {String}   id   The id of the user to return.
 *  @returns  {Object}        User object.
 */

const getUserById = id => {
  return db(TABLES.USERS)
    .where({ id })
    .first()
    .returning("*");
};

/** Find a user by github_id
 *  @param    {String}   github_id   The github_id of the user to return.
 *  @returns  {Object}        User object.
 */

const getUserByGithubId = github_id => {
  return db(TABLES.USERS)
    .where({ github_id })
    .first()
    .returning("*");
};

/** Delete user
 *  @param    {String}   id   The id of the user to delete.
 *  @returns  success message
 */

const deleteUser = id => {
  return db(TABLES.USERS)
    .where({ id })
    .del()
    .then(() => {
      // then return success message to client
      return { message: "User deleted successfully" };
    });
};

/* ================================ exports ================================ */

module.exports = {
  createUser,
  updateUser,
  getUserById,
  getUserByGithubId,
  getUsers,
  deleteUser
};
