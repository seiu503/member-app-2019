/*
   Route handler for callback after passport authentication with google.
*/

/* ================================= SETUP ================================= */

const passport = require("passport");
const users = require("../../db/models/users");

const utils = require("../utils");
const userController = require("./users.ctrl");

const APP_HOST = "http://test.seiu503signup.org"; // change this for production
const CLIENT_URL =
  process.env.NODE_ENV === "production" ? APP_HOST : "http://localhost:3000";
const SERVER_URL =
  process.env.NODE_ENV === "production" ? APP_HOST : "//localhost:3001";

/* ============================ ROUTE HANDLERS ============================= */

exports.googleCallback = (req, res) => {
  // console.log("################# google callback");
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
      // console.log("successful google auth");
      // generate token
      // return user ID & google redirect flag as URL params
      const userInfo = utils.setUserInfo(userObj);
      const token = utils.generateToken(userInfo);
      const redirect = `${CLIENT_URL}/admin/${userObj.id}/${token}`;

      return res.status(200).redirect(redirect);
    } else {
      return res.status(422).redirect("/login");
    }
  }
};

exports.requireAuth = (req, res, next) => {
  passport.authenticate("jwt", { session: false }, (err, user, info) => {
    if (err) {
      // console.log(`auth.ctrl.js > 53: ${err}`);
      return res.status(422).send({ success: false, message: err.message });
    }
    if (!user) {
      // console.log(`auth.ctrl.js > 57: no user found`);
      return res.status(422).send({
        success: false,
        message: "Sorry, you must log in to view this page."
      });
    }
    if (user) {
      req.login(user, loginErr => {
        if (loginErr) {
          return next(loginErr);
        } else {
          return next(null, user);
        }
      });
    }
  })(req, res, next);
};
