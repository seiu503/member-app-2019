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
 *  @param    {String}   userType        User access type.
 *  @param    {String}   avatar_url      Picture from google profile.
 *  @param    {String}   google_id       Google unique ID.
 *  @param    {String}   google_token    Google auth token.
 *  @returns  {Object}                   New user object OR error message.
 */
const createUser = (req, res, next) => {
  const {
    name,
    email,
    type,
    avatar_url,
    google_id,
    google_token,
    requestingUserType
  } = req.body;
  // console.log(`users.ctrl.js > 31`);
  // console.log(req.body);
  if (requestingUserType != "admin" || !requestingUserType) {
    // console.log(`users.ctrl.js > 34`);
    return res.status(500).json({
      message:
        "You do not have permission to do this. Please Consult an administrator."
    });
  }
  if (name && email && type) {
    return users
      .createUser(name, email, avatar_url, google_id, google_token, type)
      .then(users => {
        const user = users[0];
        res.locals.testData = user;
        return res.status(200).json(user);
      })
      .catch(err => {
        console.log(`users.ctrl.js > 48: ${err}`);
        let message = err.message;
        if (
          err.message.includes(
            'duplicate key value violates unique constraint "users_email_unique"'
          )
        ) {
          message = `A user with email ${email} already exists.`;
        }
        res.status(500).json({ message });
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
 ****  @param    {String}   userType    Updated User access type.
 ****  @param    {String}   avatar_url  Updated avatar_url.
 *  @returns  {Object}                   Updated user object OR error message.
 */
const updateUser = (req, res, next) => {
  // console.log(req.body);
  const { updates, requestingUserType } = req.body;
  const { id } = req.params;
  if (requestingUserType != "admin" || !requestingUserType) {
    return res.status(500).json({
      message:
        "You do not have permission to do this. Please Consult an administrator."
    });
  }
  if (!id) {
    return res.status(422).json({ message: "No Id Provided in URL" });
  }
  if (!updates || !Object.keys(updates).length) {
    return res.status(422).json({ message: "No updates submitted" });
  }
  return users
    .updateUser(id, updates)
    .then(user => {
      if (user.message || !user) {
        return res.status(404).json({
          message:
            user.message || "An error occurred while trying to update this user"
        });
      } else {
        res.locals.testData = user[0];
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
  const requestingUserType = req.params.user_type;
  if (requestingUserType != "admin" || !requestingUserType) {
    return res.status(500).json({
      message:
        "You do not have permission to do this. Please Consult an administrator."
    });
  }
  return users
    .deleteUser(req.params.id)
    .then(result => {
      if (result.message === "User deleted successfully") {
        // console.log(result.message, "119");
        return res.status(200).json({ message: result.message });
      } else {
        console.log(result.message, "122");
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
  const userType = req.params.user_type;
  if (!userType || userType !== "admin") {
    return res.status(500).json({
      message:
        "You do not have permission to do this. Please Consult an administrator."
    });
  }
  return users
    .getUsers()
    .then(result => {
      if (!result || result.message) {
        return res.status(404).json({ message: result.message });
      } else {
        res.locals.testData = result;
        return res.status(200).json(result);
      }
    })
    .catch(err => res.status(404).json({ message: err.message }));
};

/** Get one user
 *  @param    {String}   id   Id of the requested user.
 *  @returns  {Object}        User object OR error message.
 */
const getUserById = (req, res, next) => {
  const userType = req.params.user_type;
  if (!userType || userType !== "admin") {
    return res.status(500).json({
      message:
        "You do not have permission to do this. Please Consult an administrator."
    });
  }
  return users
    .getUserById(req.params.id)
    .then(user => {
      if (!user || user.message) {
        // console.log(user.message);
        return res
          .status(404)
          .json({ message: user.message || "User not found" });
      } else {
        res.locals.testData = user;
        return res.status(200).json(user);
      }
    })
    .catch(err => res.status(404).json({ message: err.message }));
};

/** Get one user
 *  @param    {String}   email   Email of the requested user.
 *  @returns  {Object}        User object OR error message.
 */
const getUserByEmail = (req, res, next) => {
  const requestingUserType = req.params.user_type;
  if (requestingUserType != "admin" || !requestingUserType) {
    return res.status(500).json({
      message:
        "You do not have permission to do this. Please Consult an administrator."
    });
  }
  return users
    .getUserByEmail(req.params.email)
    .then(user => {
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      } else {
        res.locals.testData = user;
        return res.status(200).json(user);
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
  getUserByEmail,
  getUsers
};
