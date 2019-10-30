const passport = require("passport"),
  User = require("../../db/models/users"),
  Auth = require("../config/auth"),
  JwtStrategy = require("passport-jwt").Strategy,
  ExtractJwt = require("passport-jwt").ExtractJwt,
  GoogleStrategy = require("passport-google-oauth2").Strategy,
  BASE_URL =
    process.env.NODE_CONFIG_ENV === "production"
      ? process.env.APP_HOST_PROD
      : process.env.NODE_CONFIG_ENV === "staging"
      ? process.env.APP_HOST_STAGING
      : process.env.SERVER_URL,
  googleCallbackUrl = `${BASE_URL}/api/auth/google/callback`;

/* ================================ EXPORTS ================================ */

exports.user = {
  serialize: (user, done) => {
    // console.log(`serializing user: ${user.id}`);
    return done(null, user.id);
  },

  deserialize: async (id, done) => {
    User.getUserById(id)
      .then(user => {
        return done(null, user);
      })
      .catch(err => {
        console.log(`config/auth.js > 26: ${err}`);
        return done(err, null);
      });
  }
};

exports.googleAuth = {
  clientID: process.env.GOOGLE_KEY,
  clientSecret: process.env.GOOGLE_SECRET,
  callbackURL: googleCallbackUrl
};

//= ========================
// Social logins
//= ========================

// helper methods for updating existing profile with social login info

exports.findUserByEmail = async (profile, token, done) => {
  // console.log("config.auth.js > 44: (googleId)");
  // console.log(profile.id);
  return User.getUserByEmail(profile.email)
    .then(user => {
      // console.log("config.auth.js > 48: (userId)");
      if (user) {
        // console.log(user.id);
        if (user.google_id) {
          return done(null, user);
        } else {
          return this.updateUser(profile, token, user.id, done);
        }
      }
      return done(null, null);
    })
    .catch(err => {
      console.log(`config/auth.js > 67: ${err}`);
      return done(err, null);
    });
};

exports.updateUser = async (profile, token, userId, done) => {
  const google_id = profile.id;
  const google_token = token;
  const avatar_url = profile.picture;
  updates = { google_id, google_token, avatar_url };
  // update user on database
  User.updateUser(userId, updates)
    .then(user => {
      return done(null, user);
    })
    .catch(err => {
      console.log(`config/auth.js > 82: ${err}`);
      return done(err, null);
    });
};

// JWT strategy options
exports.jwtOptions = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: process.env.JWT_SECRET,
  passReqToCallback: true
};

exports.jwtLogin = async (req, payload, done) => {
  console.log(`config/auth.js > 97: jwtLogin`);
  const id = payload.id;
  User.getUserById(id)
    .then(user => {
      req.user = user;
      return done(null, user);
    })
    .catch(err => {
      console.log(`config/auth.js > 107: ${err}`);
      return done(err, null);
    });
};

exports.jwtStrategy = new JwtStrategy(this.jwtOptions, this.jwtLogin);

// Google strategy options
exports.googleOptions = {
  clientID: this.googleAuth.clientID,
  clientSecret: this.googleAuth.clientSecret,
  callbackURL: this.googleAuth.callbackURL,
  passReqToCallback: true,
  scope: ["profile", "email"]
};

exports.googleLogin = async (req, token, refreshToken, profile, done) => {
  // console.log(
  //   `Google login by ${profile.name.givenName} ${
  //     profile.name.familyName
  //   }, ID: ${profile.id}`
  // );
  if (!req.user) {
    this.findUserByEmail(profile, token, done).catch(err => {
      console.log(`config/auth.js > 137: ${err}`);
      return done(err, null);
    });
  } else {
    return done(null, req.user);
  }
};

exports.googleStrategy = new GoogleStrategy(
  this.googleOptions,
  this.googleLogin
);
