const passport = require("passport"),
  Auth = require("../config/auth");

module.exports = passport => {
  passport.use("jwt", Auth.jwtStrategy);
  passport.use("google", Auth.googleStrategy);
};
