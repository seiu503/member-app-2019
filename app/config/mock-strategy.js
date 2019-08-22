// https://github.com/marcosnils/passport-dev/blob/master/lib/strategy.js
const passport = require("passport-strategy");
const utils = require("../../app/utils");

const name = `firstname ${utils.randomText()}`;
const email = "fakeemail@test.com";
const avatar_url = "http://example.com/avatar.png";
const google_id = "1234";
const google_token = "5678";
const mockProfile = {
  name,
  email,
  avatar_url,
  google_id,
  google_token
};
function Strategy(name, strategyCallback) {
  if (!name || name.length === 0) {
    throw new TypeError("DevStrategy requires a Strategy name");
  }
  passport.Strategy.call(this);
  this.name = name;
  this._user = mockProfile;
  // Callback supplied to OAuth2 strategies handling verification
  this._cb = strategyCallback;
}
util.inherits(Strategy, passport.Strategy);
// req, token, refreshToken, profile, done
Strategy.prototype.authenticate = function() {
  this._cb(null, null, this._user, (error, user) => {
    this.success(user);
  });
};
module.exports = {
  Strategy,
  mockProfile
};
