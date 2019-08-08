/*
   Route handlers for fetching and updating users.
*/

/* ================================= SETUP ================================= */

// import model
const users = require("../../db/models/users");

/* ============================ ROUTE HANDLERS ============================= */

/** Create a new user
 *  @param    {String}   name            Name from google profile.
 *  @param    {String}   email           Email from google profile.
 *  @param    {String}   avatar_url      Picture from google profile.
 *  @param    {String}   google_id       Google unique ID.
 *  @param    {String}   google_token    Google auth token.
 *  @returns  {Object}                   New user object OR error message.
 */
const createUser = (req, res, next) => {
  const { name, email, avatar_url, google_id, google_token } = req.body;
  if (name && email) {
    return users
      .createUser(name, email, avatar_url, google_id, google_token)
      .then(users => {
        const user = users[0];
        res.status(200).json(user);
      })
      .catch(err => {
        console.log(`users.ctrl.js > 30: ${err}`);
        res.status(500).json({ message: err.message });
      });
  } else {
    return res
      .status(500)
      .json({ message: "There was an error creating the user account" });
  }
};

/** Update an existing user
 *  @param    {String}   id              Id of user to update.
 *  @param    {Object}   updates         Key/value pairs for fields to update.
 ****  @param    {String}   name        Updated name.
 ****  @param    {String}   email       Updated email.
 ****  @param    {String}   avatar_url  Updated avatar_url.
 *  @returns  {Object}                   Updated user object OR error message.
 */
const updateUser = (req, res, next) => {
  const { updates } = req.body;
  const { id } = req.params;
  if (!updates || !Object.keys(updates).length) {
    return res.status(404).json({ message: "No updates submitted" });
  }

  return users
    .updateUser(id, updates)
    .then(user => {
      if (user.message || !user) {
        return res.status(404).json({
          message:
            user.message || "An error occured while trying to update this user"
        });
      } else {
        return res.status(200).json(user);
      }
    })
    .catch(err => res.status(500).json({ message: err.message }));
};

/** Delete user
 *  @param    {String}   id   Id of the user to delete.
 *  @returns  Success or error message.
 */
const deleteUser = (req, res, next) => {
  return users
    .deleteUser(req.params.id)
    .then(result => {
      if (result.message === "User deleted successfully") {
        return res.status(200).json({ message: result.message });
      } else {
        return res.status(404).json({
          message: "An error occurred and the user was not deleted."
        });
      }
    })
    .catch(err => res.status(404).json({ message: err.message }));
};

/** Get all users
 *  @returns  {Array|Object}   Array of user objects OR error message
 */
const getUsers = (req, res, next) => {
  return users
    .getUsers()
    .then(users => res.status(200).json(users))
    .catch(err => res.status(404).json({ message: err.message }));
};

/** Get one user
 *  @param    {String}   id   Id of the requested user.
 *  @returns  {Object}        User object OR error message.
 */
const getUserById = (req, res, next) => {
  return users
    .getUserById(req.params.id)
    .then(user => {
      if (!user || user.message) {
        console.log(user.message);
        return res
          .status(404)
          .json({ message: user.message || "User not found" });
      } else {
        res.status(200).json(user);
      }
    })
    .catch(err => res.status(404).json({ message: err.message }));
};

/* ================================ EXPORT ================================= */

module.exports = {
  createUser,
  updateUser,
  deleteUser,
  getUserById,
  getUsers
};
