/** miscellaneous utility methods **/

const jwt = require("jsonwebtoken");
const http = require("http");
const https = require("https");
const sfCtrl = require("../controllers/sf.ctrl");
const submissionCtrl = require("../controllers/submissions.ctrl");

// updated May 18, 2020, PS only (for no-js form)
const legal_language = `<div><h3>Membership Authorization</h3><p><strong>Yes, I want to join with my fellow employees and become a member of SEIU Local 503 (“Local 503”).</strong>This means I will receive the benefits and abide by the obligations of membership set forth in the Constitutions and Bylaws of both Local 503 and the Service Employees International Union (“SEIU”). I authorize Local 503 to act as my representative in collective bargaining over wages, benefits, and other terms and conditions of employment with my employer, and as my exclusive representative where authorized by law. I know that membership in the union is voluntary and is not a condition of my employment, and that I can decline to join without reprisal.</p><h3>Dues Deduction/Checkoff Authorization</h3><p>I request and voluntarily authorize my employer to deduct from my earnings and to pay to Local 503 an amount equal to the regular monthly dues and other fees or assessments uniformly applicable to members of Local 503. This authorization shall remain in effect unless I revoke it by sending written notice via U.S. mail to Local 503 during the periods not less than 30 days and not more than 45 days before either (1) the annual anniversary date of this agreement, or (2) the date of termination of the applicable collective bargaining agreement between the employer and Local 503. This authorization shall be automatically renewed from year to year unless I revoke it in writing during a window period, even if I have resigned my membership.</p><p>This authorization is voluntary and is not a condition of my employment, and I can decline to agree to it without reprisal. I understand that all members benefit from everyone’s commitments because they help to build a strong union that is able to plan for the future.</p></div>`;

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
  console.error(err && err.message ? err.message : err);
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

// format date for submission to SF
formatSFDate = date => {
  let d = new Date(date),
    month = "" + (d.getMonth() + 1),
    day = "" + d.getDate(),
    year = d.getFullYear();

  if (month.length < 2) month = "0" + month;
  if (day.length < 2) day = "0" + day;

  return [year, month, day].join("-");
};

/** Handle Tab1 & Tab2 submissions from noscript form */
// for users with javascript disabled, all front-end processing
// moved to back end

// handleTab1 performs:
// lookupSFContactByFLE
// getSFEmployers
// createSFContact
// updateSFContact
// createSumbission
const handleTab1 = async (req, res, next) => {
  req.body.birthdate = formatSFDate(req.body.birthdate);
  if (!req.body.text_auth_opt_out) {
    req.body.text_auth_opt_out = false;
  } else if (req.body.text_auth_opt_out) {
    req.body.text_auth_opt_out = true;
  }
  const formValues = { ...req.body };
  console.log(`utils/index.js > handleTab1 94: formValues`);
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

  let salesforce_id =
    lookupRes && lookupRes.salesforce_id ? lookupRes.salesforce_id : null;

  // if lookup was successful, update existing contact and move to next tab
  if (salesforce_id) {
    console.log(`utils/index.js > handleTab1 113 update contact`);
    req.params.id = salesforce_id;
    await sfCtrl
      .updateSFContact(req, res, next)
      .then(salesforce_id => {
        req.body.salesforce_id = salesforce_id;
        // create initial submission here
        submissionCtrl
          .createSubmission(req, res, next)
          .then(submissionId => {
            console.log(
              `utils/index.js > handleTab1 124: submissionId: ${submissionId}`
            );
            const redirect = `${CLIENT_URL}/ns2.html?salesforce_id=${salesforce_id}&submission_id=${submissionId}`;
            console.log(`utils/index.js > handleTab1 127: ${redirect}`);
            return res.redirect(redirect);
          })
          .catch(err => {
            console.error(`utils/index.js > handleTab1 131: ${err}`);
            return handleError(err);
          });
      })
      .catch(err => {
        console.error(`utils/index.js > handleTab1 136: ${err}`);
        return handleError(res, err);
      });
  } else {
    // otherwise, lookupSFEmployers to get accountId, then
    // create new contact with submission data,
    // then move to next tab

    const sfEmployers = await sfCtrl
      .getAllEmployers(req, res, next)
      .catch(err => {
        console.error(`utils/index.js > handleTab1 122: ${err}`);
        return handleError(err);
      });

    console.log(
      `utils/index.js > handleTab1 127: sfEmployers: ${sfEmployers.length}`
    );
    console.log(formValues.employer_name);
    const employerObject = findEmployerObject(
      sfEmployers,
      formValues.employer_name
    );
    const employer_id = employerObject.Id;
    const agency_number = employerObject.Agency_Number__c;
    console.log(
      `utils/index.js > handleTab1 136: employer_id: ${employer_id}, agency_number: ${agency_number}`
    );
    req.body.employer_id = employer_id;
    req.body.agency_number = agency_number;
    req.body.submission_date = formatSFDate(new Date());

    sfCtrl
      .createSFContact(req, res, next)
      .then(salesforce_id => {
        console.log(
          `utils/index.js > handleTab1 146: salesforce_id: ${salesforce_id}`
        );

        req.body.salesforce_id = salesforce_id;

        // create initial submission here
        submissionCtrl
          .createSubmission(req, res, next)
          .then(submissionId => {
            console.log(
              `utils/index.js > handleTab1 156: submissionId: ${submissionId}`
            );
            const redirect = `${CLIENT_URL}/ns2.html?salesforce_id=${salesforce_id}&submission_id=${submissionId}`;
            console.log(`utils/index.js > handleTab1 151: ${redirect}`);
            return res.redirect(redirect);
          })
          .catch(err => {
            console.error(`utils/index.js > handleTab1 160: ${err}`);
            return handleError(err);
          });
      })
      .catch(err => {
        console.error(`utils/index.js > handleTab1 155: ${err}`);
        return handleError(err);
      });
  }
};

// handleTab2 performs:
// updateSubmission
// createSFOMA

const handleTab2 = async (req, res, next) => {
  console.log(`utils/index.js > 197 handleTab2: formValues`);
  const formValues = { ...req.body };
  console.log(formValues);
  req.locals = {
    next: true
  };
  req.params = {
    id: req.body.submission_id
  };
  submissionCtrl
    .updateSubmission(req, res, next)
    .then(submissionBody => {
      req.body = { ...formValues, ...submissionBody };
      req.body.online_campaign_source = "NoJavascript";
      req.body.legal_language = legal_language;
      req.body.maintenance_of_effort = formatSFDate(new Date());
      req.body.seiu503_cba_app_date = formatSFDate(new Date());
      req.body.immediate_past_member_status = "Not a Member";
      console.log(`utils.index.js > 228 handleTab2: req.body`);
      console.log(req.body);
      sfCtrl.createSFOnlineMemberApp(req, res, next).then(sf_OMA_id => {
        console.log(`utils/index.js > 231 handleTab2 sfOMA success`);
        return res.redirect("https://seiu503.org/members/thank-you/");
      });
    })
    .catch(err => {
      console.error(`utils/index.js > handleTab2 236: ${err}`);
      return handleError(err);
    });
};

module.exports = {
  randomText,
  handleError,
  setUserInfo,
  generateToken,
  getClientIp,
  formatSFDate,
  handleTab1,
  handleTab2
};
