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
  process.env.NODE_ENV === "production" ? APP_HOST : "//localhost:8080";

/* ============================ ROUTE HANDLERS ============================= */

exports.googleCallback = (req, res) => {
  // console.log("################# google callback");
  if (req.authError) {
    res.status(401).json({
      success: false,
      message: req.authError,
      error: req.authError
    });
  }
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

const jwtCallback = (req, res, next) => {
  console.log("auth.ctrl.js > 59: jwtCallback");
  if (req.authError) {
    console.log(`auth.ctrl.js > 61: ${req.authError}`);
    res.status(422).json({
      success: false,
      message: `jwt auth failed: {req.authError}`,
      error: req.authError
    });
  }
  if (req.user && req.user.err) {
    console.log(`auth.ctrl.js > 69: ${req.user.err}`);
    res.status(422).json({
      success: false,
      message: `jwt auth failed: ${req.user.err}`,
      error: req.user.err
    });
  }
  if (!req.user) {
    console.log(`auth.ctrl.js > 77: no user found`);
    return res.status(422).send({
      success: false,
      message: "Sorry, you must log in to view this page."
    });
  }
  if (req.user) {
    console.log(`auth.ctrl.js > 84`);
    console.log(req.user.id);
    req.login(req.user, loginErr => {
      if (loginErr) {
        return next(loginErr);
      } else {
        return next(null, req.user);
      }
    });
  }
};

exports.requireAuth = async (req, res, next) => {
  console.log(`auth.ctrl.js > 97: requireAuth`);
  await passport.authenticate("jwt", { session: false }, (token, done) =>
    jwtCallback(req, res, next)
  )(req, res, next);
};
