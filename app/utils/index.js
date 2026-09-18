/** miscellaneous utility methods **/

const jwt = require("jsonwebtoken");
const http = require("http");
const https = require("https");
const sfCtrl = require("../controllers/sf.ctrl");
const submissionCtrl = require("../controllers/submissions.ctrl");

const CLIENT_URL =
  process.env.NODE_CONFIG_ENV === "production"
    ? process.env.APP_HOST_PROD
    : process.env.NODE_CONFIG_ENV === "staging"
    ? process.env.APP_HOST_STAGING
    : process.env.CLIENT_URL;

/** Helper method to generate random text strings for testing */
const randomText = () => {
  let text = "";
  let possible =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

  for (let i = 0; i < 5; i++)
    text += possible.charAt(Math.floor(Math.random() * possible.length));

  return text;
};

/** Error handler for route controllers */
const handleError = (res, err) => {
  // console.log(`utils/index.js > handleError`);
  // console.error(err && err.message ? err.message : err);
  return res.status(500).json({ message: err });
};

/** Extract id from user object for use in generating JWT */
const setUserInfo = req => {
  const getUserInfo = {
    id: req.id
  };

  return getUserInfo;
};

/** Generate JWT */
generateToken = user => {
  return jwt.sign(user, process.env.JWT_SECRET, {
    expiresIn: "7d"
  });
};

/** Get client IP from req */
getClientIp = req => req.headers["x-real-ip"] || req.connection.remoteAddress;

// format date for submission to SF
const formatSFDate = value => {
  if (
    typeof value === "string" &&
    /^\d{4}-\d{2}-\d{2}$/.test(value)
  ) {
    return value;
  }

  const d = new Date(value);
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  const year = d.getFullYear();

  return `${year}-${month}-${day}`;
};

module.exports = {
  randomText,
  handleError,
  setUserInfo,
  generateToken,
  getClientIp,
  formatSFDate
};
