/*
   Route handler for callback after passport authentication with google.
*/

/* ================================= SETUP ================================= */

import passport from "passport";
import users from "../../db/models/users.js";

import utils from "../utils.js";
import userController from "./users.ctrl.js";

const CLIENT_URL =
  process.env.NODE_CONFIG_ENV === "production"
    ? process.env.APP_HOST_PROD
    : process.env.NODE_CONFIG_ENV === "staging"
    ? process.env.APP_HOST_STAGING
    : process.env.CLIENT_URL;

console.log(`CLIENT_URL: ${CLIENT_URL}`);

/* ============================ ROUTE HANDLERS ============================= */

exports const googleCallback = (req, res) => {
  // console.log("################# google callback");
  if (req.authError) {
    return res.status(401).json({
      success: false,
      message: req.authError,
      error: req.authError
    });
  }
  if (req.user && req.user.err) {
    console.error(`auth.ctrl.js > 46: ${req.user.err}`);
    return res.status(401).json({
      success: false,
      message: `google auth failed: ${req.user.err}`,
      error: req.user.err
    });
  } else {
    const userObj = req.user ? { ...req.user } : undefined;
    if (userObj) {
      // successful authentication from provider
      // console.log("##############  successful google auth");
      let user = userObj;
      if (userObj["0"] && userObj["0"].id) {
        user = userObj["0"];
      }
      // generate token
      // return user ID & google redirect flag as URL params
      const userInfo = utils.setUserInfo(user);
      const token = utils.generateToken(userInfo);
      const redirect = `${CLIENT_URL}/admin/${user.id}/${token}`;

      return res.status(200).redirect(redirect);
    } else {
      console.error(`auth.ctrl.js > 54: !user`);
      return res.status(422).redirect(`${CLIENT_URL}/login`);
    }
  }
};

export const jwtCallback = (req, res, next) => {
  // console.log("auth.ctrl.js > 59: jwtCallback");
  if (req.authError) {
    console.log(`auth.ctrl.js > 61: ${req.authError}`);
    return res.status(422).json({
      success: false,
      message: `jwt auth failed: ${req.authError}`,
      error: req.authError
    });
  }
  if (req.user && req.user.err) {
    console.log(`auth.ctrl.js > 69: ${req.user.err}`);
    return res.status(422).json({
      success: false,
      message: `jwt auth failed: ${req.user.err}`,
      error: req.user.err
    });
  }
  if (!req.user) {
    console.log(`auth.ctrl.js > 77: no user found`);
    return res.status(422).json({
      success: false,
      message: "Sorry, you must log in to view this page."
    });
  }
  if (req.user) {
    // console.log(`auth.ctrl.js > 84`);
    // console.log(req.user.id);
    req.login(req.user, loginErr => {
      if (loginErr) {
        return next(loginErr);
      } else {
        return next(null, req.user);
      }
    });
  }
};

export const noAccess = (req, res) => {
  const message = encodeURIComponent(
    "You need an invitation from an administrator before you can create an account"
  );
  const redirect = `${CLIENT_URL}/noaccess?message=${message}`;
  return res.status(422).redirect(redirect);
};

export const requireAuth = async (req, res, next) => {
  console.log(`auth.ctrl.js > 97: requireAuth`);
  await passport.authenticate("jwt", { session: false }, (token, done) =>
    this.jwtCallback(req, res, next)
  )(req, res, next);
};
