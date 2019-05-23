// Importing Passport, strategies, and config
const passport = require("passport"),
  User = require("../../db/models/users"),
  Auth = require("../config/auth"),
  JwtStrategy = require("passport-jwt").Strategy,
  ExtractJwt = require("passport-jwt").ExtractJwt,
  GoogleStrategy = require("passport-google-oauth2").Strategy;

module.exports = passport => {
  // JWT strategy options
  const jwtOptions = {
    // Telling Passport to check authorization headers for JWT
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    // Telling Passport where to find the secret
    secretOrKey: process.env.JWT_SECRET,
    passReqToCallback: true
  };

  // JWT login strategy
  passport.use(
    "jwt",
    new JwtStrategy(jwtOptions, (req, payload, done) => {
      // console.log(payload);
      const id = payload._id;
      User.getUserById(id)
        .then(user => {
          done(null, user);
        })
        .catch(err => {
          done(err, null);
        });
    })
  );

  //= ========================
  // Social logins
  //= ========================

  // helper methods for updating existing profile with social login info

  const findExistingUser = (profile, token, done) => {
    console.log("findExistingUser");
    const google_id = profile.id;
    User.getUserByGoogleId(google_id)
      .then(user => {
        if (!user) {
          console.log("user not found, going to saveNewUser");
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
  const saveNewUser = (profile, token, done) => {
    console.log("saveNewUser");
    console.log("#########################");
    console.log("google profile data structure");
    console.log(profile);
    const google_id = profile.id;
    const google_token = token;
    const email = profile.emails ? profile.emails[0].value : "";
    const name = `${profile.name.givenName} ${profile.name.familyName}`;
    const avatar_url = profile.picture;

    // save new user to database
    User.createUser(name, email, avatar_url, google_id, google_token)
      .then(user => {
        console.log(`saving new user to db`);
        return done(null, user);
      })
      .catch(err => {
        console.log(err);
        return done(err, null);
      });
  };

  // Google strategy options
  const googleOptions = {
    clientID: Auth.googleAuth.clientID,
    clientSecret: Auth.googleAuth.clientSecret,
    callbackURL: Auth.googleAuth.callbackURL,
    passReqToCallback: true,
    scope: ["profile", "email"]
  };

  // Google login strategy
  passport.use(
    "google",
    new GoogleStrategy(
      googleOptions,
      (req, token, refreshToken, profile, done) => {
        console.log(`Google login by ${profile.name}, ID: ${profile.id}`);
        process.nextTick(() => {
          console.log(req.user);
          // check if user is already logged in
          if (!req.user) {
            findExistingUser(profile, token, done);
          } else {
            // found logged-in user. Return
            console.log("google found user");
            console.log(req.user);
            return done(null, req.user);
          }
        }); // process.nextTick()
      }
    ) // GoogleStrategy
  );
};
