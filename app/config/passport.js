// Importing Passport, strategies, and config
const passport = require("passport"),
  User = require("../../db/models/users"),
  Auth = require("../config/auth"),
  JwtStrategy = require("passport-jwt").Strategy,
  ExtractJwt = require("passport-jwt").ExtractJwt,
  GoogleStrategy = require("passport-google-oauth2").Strategy;

module.exports = passport => {
  passport.use(
    "jwt",
    new JwtStrategy(Auth.jwtOptions, (req, payload, done) => {
      const id = payload.id;
      User.getUserById(id)
        .then(user => {
          // console.log(`passport.js > 23`);
          // console.log(user);
          done(null, user);
        })
        .catch(err => {
          // console.log("passport.js > 28");
          // console.log(err);
          done(err, null);
        });
    })
  );

  passport.use(
    "google",
    new GoogleStrategy(
      Auth.googleOptions,
      (req, token, refreshToken, profile, done) => {
        // console.log(`Google login by ${profile.name}, ID: ${profile.id}`);
        if (!req.user) {
          Auth.findExistingUser(profile, token, done);
        } else {
          // found logged-in user. Return
          return done(null, req.user);
        }
      }
    )
  );
};
