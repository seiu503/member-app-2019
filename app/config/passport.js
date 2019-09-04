// Importing Passport, strategies, and config
const passport = require("passport"),
  // User = require("../../db/models/users"),
  Auth = require("../config/auth");
// JwtStrategy = require("passport-jwt").Strategy,
// ExtractJwt = require("passport-jwt").ExtractJwt,
// GoogleStrategy = require("passport-google-oauth2").Strategy;

module.exports = passport => {
  passport.use("jwt", Auth.jwtStrategy);

  passport.use("google", Auth.googleStrategy);
};
