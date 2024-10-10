// db/models/users.js

/* ================================= SETUP ================================= */

import uuid from "uuid";
import { db, TABLES } from "../../app/config/knexConfig.js";

/* ============================ PUBLIC METHODS ============================= */

/** Create a user
 *  @param    {String}   name           New user full name.
 *  @param    {String}   email          New user email.
 *  @param    {String}   avatar_url     New user avatar url.
 *  @param    {String}   google_id      New user google id.
 *  @param    {String}   google_token   New user google token.
 *  @param    {String}   type           New user type
 *  @returns  {Array}    Array of 1 newly-created User object.
 */
export const createUser = (name, email, avatar_url, google_id, google_token, type) => {
  console.log(`models/users.js > ${type}`);
  return db
    .insert({
      id: uuid.v4(),
      name,
      email,
      avatar_url,
      google_id,
      google_token,
      type
    })
    .into(TABLES.USERS)
    .returning("*");
};

/** Update a user
 *  @param    {String}   id             The id of the user to update.
 *  @param    {Object}   updates        Key/value pairs of fields to update.
 ****  @param    {String}   name           Updated name.
 ****  @param    {String}   email          Updated email.
 ****  @param    {String}   avatar_url     Updated avatar url.
 ****  @param    {String}   google_id      Updated google_id.
 ****  @param    {String}   google_token   Updated google_token.
 ****  @param    {String}   type           Updated user type
 *  @returns  {Object}   User object.
 */
export const updateUser = (id, updates) => {
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

export const getUsers = () => {
  return db(TABLES.USERS).returning("*");
};

/** Find a user by id
 *  @param    {String}   id   The id of the user to return.
 *  @returns  {Object}        User object.
 */

export const getUserById = id => {
  return db(TABLES.USERS)
    .where({ id })
    .first()
    .returning("*");
};

/** Find a user by email
 *  @param    {String}   email   The email of the user to return.
 *  @returns  {Object}        User object.
 */

export const getUserByEmail = email => {
  return db(TABLES.USERS)
    .where({ email })
    .first()
    .returning("*");
};

/** Find a user by google_id
 *  @param    {String}   google_id   The google_id of the user to return.
 *  @returns  {Object}        User object.
 */

export const getUserByGoogleId = google_id => {
  return db(TABLES.USERS)
    .where({ google_id })
    .first()
    .returning("*");
};

/** Delete user
 *  @param    {String}   id   The id of the user to delete.
 *  @returns  success message
 */

export const deleteUser = id => {
  return db(TABLES.USERS)
    .where({ id })
    .del()
    .then(() => {
      // then return success message to client
      return { message: "User deleted successfully" };
    });
};

/* ================================ exports ================================ */

export default {
  createUser,
  updateUser,
  getUserById,
  getUserByGoogleId,
  getUsers,
  deleteUser,
  getUserByEmail
};
