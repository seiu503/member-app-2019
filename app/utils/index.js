/** miscellaneous utility methods **/

const jwt = require("jsonwebtoken");

/** Helper method to remove duplicates from an array **/
const onlyUnique = (value, index, self) => {
  return self.indexOf(value) === index;
};

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
  return res.status(500).json({ message: err });
};

/** Extract id from user object for use in generating JWT */
const setUserInfo = req => {
  const getUserInfo = {
    _id: req._id
  };

  return getUserInfo;
};

/** Generate JWT */
generateToken = user => {
  return jwt.sign(user, process.env.JWT_SECRET, {
    expiresIn: "7d"
  });
};

module.exports = {
  onlyUnique,
  randomText,
  handleError,
  setUserInfo,
  generateToken
};
