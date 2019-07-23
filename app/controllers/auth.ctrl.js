/*
   Route handler for callback after passport authentication with google.
*/

/* ================================= SETUP ================================= */

// import model
const users = require("../../db/models/users");

const passport = require("passport");
const utils = require("../utils");
const userController = require("./users.ctrl");

const APP_HOST = process.env.APP_HOST;
const CLIENT_URL =
  process.env.NODE_ENV === "production" ? APP_HOST : "http://localhost:3000";
const SERVER_URL =
  process.env.NODE_ENV === "production" ? APP_HOST : "//localhost:3001";

/* ============================ ROUTE HANDLERS ============================= */

exports.googleCallback = (req, res) => {
  console.log("################# google callback");
  if (req.user && req.user.err) {
    res.status(401).json({
      success: false,
      message: `google auth failed: ${req.user.err}`,
      error: req.user.err
    });
  } else {
    const userObj = req.user
      ? { ...req.user }
      : req.session && req.session.user
      ? { ...req.session.user }
      : undefined;
    if (userObj) {
      // successful authentication from provider
      console.log("successful google auth");
      // generate token
      // return user ID & google redirect flag as URL params
      const userInfo = utils.setUserInfo(userObj);
      const token = utils.generateToken(userInfo);

      return res.redirect(`${CLIENT_URL}/admin/${userObj.id}/${token}`);
    } else {
      return res.redirect("/login");
    }
  }
};
