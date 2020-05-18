/** miscellaneous utility methods **/

const jwt = require("jsonwebtoken");
const http = require("http");
const https = require("https");
const sfCtrl = require("../controllers/sf.ctrl");

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
  console.log(`utils/index.js > handleError`);
  console.error(err.message ? err.message : err);
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

// find matching employer object from SF Employers array returned from API
findEmployerObject = (employerObjects, employerName) =>
  employerObjects
    ? employerObjects.filter(obj => {
        if (employerName.toLowerCase() === "community member") {
          return obj.Name.toLowerCase() === "community members";
        }
        return obj.Name.toLowerCase() === employerName.toLowerCase();
      })[0]
    : { Name: "" };

/** Handle Tab1 submit from noscript form */
// for users with javascript disabled, all front-end processing
// has to be moved to back end

const handleTab1 = async (req, res, next) => {
  console.log(`utils/index.js > handleTab1 61: formValues`);
  const formValues = { ...req.body };
  console.log(formValues);
  req.locals = {
    next: true
  };

  // lookup contact by first/last/email
  const lookupRes = await sfCtrl
    .lookupSFContactByFLE(req, res, next)
    .catch(err => {
      console.error(err);
      return handleError(err);
    });

  console.log(`utils/index.js > handleTab1 66: lookupRes.status`);
  console.log(lookupRes ? lookupRes : "lookupRes is undefined");

  let salesforce_id =
    lookupRes && lookupRes.salesforce_id ? lookupRes.salesforce_id : null;

  // if lookup was successful, update existing contact and move to next tab
  if (salesforce_id) {
    console.log(`utils/index.js > handleTab1 77`);
    req.params.id = salesforce_id;
    await sfCtrl
      .updateSFContact(req, res, next)
      .then(salesforce_id => {
        console.log(
          `utils/index.js > handleTab1 75 salesforceId: ${salesforce_id}`
        );
        const redirect = `${CLIENT_URL}/ns2.html?salesforce_id=${salesforce_id}`;
        console.log(`utils/index.js > handleTab1 77 redirect: ${redirect}`);
        return res.status(200).redirect(redirect);
      })
      .catch(err => {
        console.error(`utils/index.js > handleTab1 81: ${err}`);
        return handleError(res, err);
      });
  } else {
    // otherwise, lookupSFEmployers to get accountId, then
    // create new contact with submission data,
    // then move to next tab

    const sfEmployers = await sfCtrl
      .getAllEmployers(req, res, next)
      .catch(err => {
        console.error(`utils/index.js > handleTab1 112: ${err}`);
        return handleError(err);
      });

    console.log(
      `utils/index.js > handleTab1 118: sfEmployers: ${sfEmployers.length}`
    );
    console.log(formValues.employer_name);
    const employerObject = findEmployerObject(
      sfEmployers,
      formValues.employer_name
    );
    const employer_id = employerObject.Id;
    console.log(`utils/index.js > handleTab1 122: employer_id: ${employer_id}`);
    req.body.employer_id = employer_id;

    sfCtrl
      .createSFContact(req, res, next)
      .then(salesforce_id => {
        console.log(`utils/index.js > handleTab1 131`);
        console.log(salesforce_id);

        console.log(
          `utils/index.js > handleTab1 132: salesforce_id: ${salesforce_id}`
        );
        const redirect = `${CLIENT_URL}/ns2.html?salesforce_id=${salesforce_id}`;
        console.log(`utils/index.js > handleTab1 134: ${redirect}`);
        return res.redirect(redirect);
      })
      .catch(err => {
        console.error(`utils/index.js > handleTab1 127: ${err}`);
        return handleError(err);
      });
  }
};

module.exports = {
  randomText,
  handleError,
  setUserInfo,
  generateToken,
  getClientIp,
  handleTab1
};
