const passport = require("passport");
const User = require("../../db/models/users");

const user = {
  serialize: (user, done) => {
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

const githubAuth = {
  clientID: process.env.GITHUB_KEY,
  clientSecret: process.env.GITHUB_SECRET,
  callbackURL: `${process.env.SERVER_URL}/api/auth/github/callback`
};

module.exports = { user, githubAuth };
