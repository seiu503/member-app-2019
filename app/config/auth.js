import passport from "passport";
import User from "../../db/models/users.js";
import Auth from "../config/auth.js";
import { JwtStrategy, ExtractJwt } from "passport-jwt";
import { GoogleStrategy } from  "passport-google-oauth2";
const  BASE_URL =
    process.env.NODE_CONFIG_ENV === "production"
      ? process.env.APP_HOST_PROD
      : process.env.NODE_CONFIG_ENV === "staging"
      ? process.env.APP_HOST_STAGING
      : process.env.SERVER_URL,
  googleCallbackUrl = `${BASE_URL}/api/auth/google/callback`;

/* ================================ EXPORTS ================================ */

export const user = {
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

export const googleAuth = {
  clientID: process.env.GOOGLE_KEY,
  clientSecret: process.env.GOOGLE_SECRET,
  callbackURL: googleCallbackUrl
};

//= ========================
// Social logins
//= ========================

// helper methods for updating existing profile with social login info

export const findUserByEmail = async (profile, token, done) => {
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

export const updateUser = async (profile, token, userId, done) => {
  const google_id = profile.id;
  const google_token = token;
  // Sept 2021 update: google profile.picture url has changed format; is now too long to fit a VarChar(255) field. If you want to use this in the future you need to run a knex migration and update the field data type. For now feels not worth it, just eliminating avatar url from updates.
  // const avatar_url = profile.picture;
  // updates = { google_id, google_token, avatar_url };
  updates = { google_id, google_token };
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
export const jwtOptions = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: process.env.JWT_SECRET,
  passReqToCallback: true
};

export const jwtLogin = async (req, payload, done) => {
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

export const jwtStrategy = new JwtStrategy(this.jwtOptions, this.jwtLogin);

// Google strategy options
export const googleOptions = {
  clientID: this.googleAuth.clientID,
  clientSecret: this.googleAuth.clientSecret,
  callbackURL: this.googleAuth.callbackURL,
  passReqToCallback: true,
  scope: ["profile", "email"]
};

export const googleLogin = async (req, token, refreshToken, profile, done) => {
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

export const googleStrategy = new GoogleStrategy(
  this.googleOptions,
  this.googleLogin
);
