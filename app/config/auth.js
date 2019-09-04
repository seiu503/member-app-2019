const passport = require("passport"),
  User = require("../../db/models/users"),
  Auth = require("../config/auth"),
  JwtStrategy = require("passport-jwt").Strategy,
  ExtractJwt = require("passport-jwt").ExtractJwt,
  GoogleStrategy = require("passport-google-oauth2").Strategy;

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
  callbackURL: `${process.env.SERVER_URL}/api/auth/google/callback`
};

//= ========================
// Social logins
//= ========================

// helper methods for updating existing profile with social login info

const findExistingUser = async (profile, token, done) => {
  const google_id = profile.id;
  User.getUserByGoogleId(google_id)
    .then(user => {
      if (!user) {
        console.log("42");
        return saveNewUser(profile, token, done);
      } else {
        return done(null, user);
      }
    })
    .catch(err => {
      done(err, null);
    });
};

// save new user
const saveNewUser = async (profile, token, done) => {
  const google_id = profile.id;
  const google_token = token;
  const email = profile.emails ? profile.emails[0].value : "";
  const name = `${profile.name.givenName} ${profile.name.familyName}`;
  const avatar_url = profile.picture;

  // save new user to database
  User.createUser(name, email, avatar_url, google_id, google_token)
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

const jwtStrategy = new JwtStrategy(jwtOptions, (req, payload, done) => {
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
});

// Google strategy options
const googleOptions = {
  clientID: googleAuth.clientID,
  clientSecret: googleAuth.clientSecret,
  callbackURL: googleAuth.callbackURL,
  passReqToCallback: true,
  scope: ["profile", "email"]
};

const googleStrategy = new GoogleStrategy(
  googleOptions,
  (req, token, refreshToken, profile, done) => {
    console.log(`Google login by ${profile.name}, ID: ${profile.id}`);
    if (!req.user) {
      findExistingUser(profile, token, done);
    } else {
      // found logged-in user. Return
      return done(null, req.user);
    }
  }
);

module.exports = {
  user,
  googleAuth,
  findExistingUser,
  saveNewUser,
  jwtOptions,
  jwtStrategy,
  googleOptions,
  googleStrategy
};
