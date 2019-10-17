const passport = require("passport"),
  User = require("../../db/models/users"),
  Auth = require("../config/auth"),
  JwtStrategy = require("passport-jwt").Strategy,
  ExtractJwt = require("passport-jwt").ExtractJwt,
  GoogleStrategy = require("passport-google-oauth2").Strategy,
  prodUrl = "https://test.seiu503signup.org", // NO TRAILING SLASH
  devUrl = "http://localhost:8080", // server url for local install
  BASE_URL = process.env.NODE_ENV === "production" ? prodUrl : devUrl, //
  googleCallbackUrl = `${BASE_URL}/api/auth/google/callback`;

/* ================================ EXPORTS ================================ */

const user = {
  serialize: (user, done) => {
    // console.log(`serializing user: ${user.id}`);
    done(null, user.id);
  },

  deserialize: async (id, done) => {
    User.getUserById(id)
      .then(user => {
        done(null, user);
      })
      .catch(err => {
        done(err, null);
      });
  }
};

const googleAuth = {
  clientID: process.env.GOOGLE_KEY,
  clientSecret: process.env.GOOGLE_SECRET,
  callbackURL: googleCallbackUrl
};

//= ========================
// Social logins
//= ========================

// helper methods for updating existing profile with social login info

const findUserByEmail = async (profile, token, done) => {
  // console.log("config.auth.js > 44: (googleId)");
  // console.log(profile.id);
  User.getUserByEmail(profile.email)
    .then(user => {
      // console.log("config.auth.js > 48: (userId)");
      if (user) {
        // console.log(user.id);
        if (user.google_id) {
          return done(null, user);
        } else {
          return updateUser(profile, token, user.id, done);
        }
      }
      err = "You need an invitation from an administrator first";
      return done(err, null);
    })
    .catch(err => {
      done(err, null);
    });
};

const updateUser = async (profile, token, userId, done) => {
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
      console.log(err);
      return done(err, null);
    });
};

// JWT strategy options
const jwtOptions = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: process.env.JWT_SECRET,
  passReqToCallback: true
};

const jwtLogin = async (req, payload, done) => {
  console.log(`config/auth.js > 128: jwtLogin`);
  const id = payload.id;
  User.getUserById(id)
    .then(user => {
      console.log(`config/auth.js > 132`);
      console.log(user.id);
      req.user = user;
      done(null, user);
    })
    .catch(err => {
      console.log("config/auth.js > 137");
      console.log(err);
      done(err, null);
    });
};

const jwtStrategy = new JwtStrategy(jwtOptions, jwtLogin);

// Google strategy options
const googleOptions = {
  clientID: googleAuth.clientID,
  clientSecret: googleAuth.clientSecret,
  callbackURL: googleAuth.callbackURL,
  passReqToCallback: true,
  scope: ["profile", "email"]
};

const googleLogin = async (req, token, refreshToken, profile, done) => {
  // console.log(
  //   `Google login by ${profile.name.givenName} ${
  //     profile.name.familyName
  //   }, ID: ${profile.id}`
  // );
  if (!req.user) {
    return findUserByEmail(profile, token, done).catch(err => {
      console.log(err);
    });
  } else {
    // found logged-in user. Return
    return done(null, req.user);
  }
};

const googleStrategy = new GoogleStrategy(googleOptions, googleLogin);

module.exports = {
  user,
  googleAuth,
  findUserByEmail,
  updateUser,
  jwtOptions,
  jwtLogin,
  jwtStrategy,
  googleOptions,
  googleLogin,
  googleStrategy
};
