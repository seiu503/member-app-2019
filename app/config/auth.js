const passport = require("passport");
const User = require("../../db/models/users");

const user = {
  serialize: (user, done) => {
    console.log("app/config/auth.js > 6");
    console.log(`serializing user: ${user.name}`);
    done(null, user.id);
  },

  deserialize: (id, done) => {
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

module.exports = { user, googleAuth };
