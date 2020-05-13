/** miscellaneous utility methods **/

const jwt = require("jsonwebtoken");
const http = require("http");
const https = require("https");

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

// lookupSFContact
// updateSFContact
// createSFContact

/** Handle Tab1 submit from noscript form */
// for users with javascript disabled, all front-end processing
// has to be moved to back end

const handleTab1 = async (req, res) => {
  const formValues = { ...req.body };
  console.log(`utils/index.js > handleTab1 61: formValues`);
  console.log(formValues);

  // lookup contact by first/last/email
  await lookupSFContact(formValues).catch(err => {
    console.error(err);
    return handleError(err);
  });

  // if lookup was successful, update existing contact and move to next tab
  if (this.props.submission.salesforceId) {
    await updateSFContact(formValues)
      .then(res => {
        const salesforceId = res.locals.sf_contact_id;
        console.log(
          `utils/index.js > handleTab1 75 salesforceId: ${salesforceId}`
        );
        const redirect = `${CLIENT_URL}/ns2?salesforceId=${salesforceId}`;
        console.log(`utils/index.js > handleTab1 77 redirect: ${redirect}`);
        return res.status(200).redirect(redirect);
      })
      .catch(err => {
        console.error(`utils/index.js > handleTab1 81: ${err}`);
        return handleError(res, err);
      });
  }

  // otherwise, create new contact with submission data,
  // then move to next tab
  await createSFContact(formValues)
    .then(res => {
      const salesforceId = res.locals.sf_contact_id;
      console.log(`utils/index.js > handleTab1 92: ${salesforceId}`);
      const redirect = `${CLIENT_URL}/ns2?salesforceId=${salesforceId}`;
      console.log(`utils/index.js > handleTab1 94: ${redirect}`);
      return res.status(200).redirect(redirect);
    })
    .catch(err => {
      console.error(`utils/index.js > handleTab1 98: ${err}`);
      return handleError(err);
    });
  return this.props.changeTab(1);
};

module.exports = {
  randomText,
  handleError,
  setUserInfo,
  generateToken,
  getClientIp,
  handleTab1
};
