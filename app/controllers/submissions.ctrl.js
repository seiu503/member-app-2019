var request = require("request");

/*
   Route handlers for fetching and updating submissions.
*/

/* ================================= SETUP ================================= */

// import models
const submissions = require("../../db/models/submissions");

/* ============================ ROUTE HANDLERS ============================= */

/** Create a Submission
 *  @param    {String}   ip_address             IP address
 *  @param    {Timestamp} submission_date       Submission timestamp
 *  @param    {String}   agency_number          Agency number
 *  @param    {String}   birthdate              Birthdate
 *  @param    {String}   cell_phone             Cell phone
 *  @param    {String}   employer_name          Employer name
 *  @param    {String}   first_name             First name
 *  @param    {String}   last_name              Last name
 *  @param    {String}   home_street            Home street
 *  @param    {String}   home_city              Home city
 *  @param    {String}   home_state             Home state
 *  @param    {String}   home_zip               Home zip
 *  @param    {String}   home_email             Home email
 *  @param    {String}   preferred_language     Preferred language
 *  @param    {Boolean}  terms_agree            Agreement to membership terms
 *  @param    {String}   Signature              URL of signature image
 *  @param    {Boolean}  text_auth_opt_out      Text authorization opt out
 *  @param    {String}   online_campaign_source Online campaign source
 *  @param    {String}   contact_id             Contact id
 *  @param    {String}   legal_language         Dynamic dump of html legal language on form at time of submission
 *  @param    {Date}  maintenance_of_effort     Date of submission; confirmation of MOE checkbox
 *  @param    {Date}   seiu503_cba_app_date     Date of submission; confirmation of submitting membership form
 *  @param    {Date}   direct_pay_auth          Date of submission; confirmation of direct pay authorization
 *  @param    {Date}   direct_deposit_auth      Date of submission; confirmation of direct deposit authorization
 *  @param    {String}   immediate_past_member_status   Immediate past member status (populated from SF for existing contact matches)
 *  @returns  {Object}    New Submission Object or error message.
 */
const createSubmission = async (req, res, next) => {
  // console.log("submissions.ctrl.js > 43: createSubmission");
  let {
    ip_address,
    submission_date,
    agency_number,
    birthdate,
    cell_phone,
    employer_name,
    first_name,
    last_name,
    home_street,
    home_city,
    home_state,
    home_zip,
    home_email,
    preferred_language,
    terms_agree,
    signature,
    text_auth_opt_out,
    online_campaign_source,
    legal_language,
    maintenance_of_effort,
    seiu503_cba_app_date,
    direct_pay_auth,
    direct_deposit_auth,
    immediate_past_member_status,
    salesforce_id,
    reCaptchaValue
  } = req.body;

  if (!salesforce_id || salesforce_id === undefined) {
    salesforce_id = res.locals.sf_contact_id;
  }

  const requiredFields = [
    "submission_date",
    "birthdate",
    "cell_phone",
    "employer_name",
    "first_name",
    "last_name",
    "home_street",
    "home_city",
    "home_state",
    "home_zip",
    "home_email",
    "preferred_language",
    "terms_agree",
    "signature",
    "legal_language",
    "maintenance_of_effort",
    "seiu503_cba_app_date"
  ];

  const missingField = requiredFields.find(field => !(field in req.body));
  if (!terms_agree) {
    return res.status(422).json({
      reason: "ValidationError",
      message: "Must agree to terms of service"
    });
  } else if (missingField) {
    // console.log(`submissions.ctrl.js > 105: missing ${missingField}`);
    return res.status(422).json({
      reason: "ValidationError",
      message: `Missing required field ${missingField}`
    });
  }
  // else if (process.env.NODE_ENV !== "testing") {
  //   verifyHumanity(reCaptchaValue, ip_address).catch(err => {
  //     console.log(err);
  //     return res
  //       .status(422)
  //       .json({ message: "ReCaptcha verification failed" });
  //   });
  // }
  const createSubmissionResult = await submissions.createSubmission(
    ip_address,
    submission_date,
    agency_number,
    birthdate,
    cell_phone,
    employer_name,
    first_name,
    last_name,
    home_street,
    home_city,
    home_state,
    home_zip,
    home_email,
    preferred_language,
    terms_agree,
    signature,
    text_auth_opt_out,
    online_campaign_source,
    legal_language,
    maintenance_of_effort,
    seiu503_cba_app_date,
    direct_pay_auth,
    direct_deposit_auth,
    immediate_past_member_status,
    salesforce_id
  );

  if (!createSubmissionResult || createSubmissionResult.message) {
    // console.log(
    //   `submissions.ctrl.js > 135: ${createSubmissionResult.message ||
    //     "There was an error saving the submission"}`
    // );
    return res.status(500).json({
      message:
        createSubmissionResult.message ||
        "There was an error saving the submission"
    });
  } else {
    res.locals.submission_id = createSubmissionResult[0].id;
    return res
      .status(200)
      .json({ salesforce_id, submission_id: createSubmissionResult[0].id });
  }
};

/** Update a Submission
 *  @param    {String}   id             The id of the submission to update.
 *  @param    {Object}   updates        Key/value pairs of fields to update.
 *  @returns  {Object}      Updated Submission object.
 */
const updateSubmission = async (req, res, next) => {
  const updates = req.body;
  const { id } = req.params;
  // console.log(`subm.ctrl.js > 173: ${id}`);
  // console.log(updates);
  try {
    if (!updates || !Object.keys(updates).length) {
      return res.status(422).json({ message: "No updates submitted" });
    }
    if (!id) {
      return res.status(422).json({ message: "No Id Provided in URL" });
    }

    const updateSubmissionResult = await submissions.updateSubmission(
      id,
      updates
    );

    if (
      !updateSubmissionResult ||
      updateSubmissionResult.message ||
      updateSubmissionResult.length === 0
    ) {
      const errmsg =
        updateSubmissionResult.message ||
        "There was an error updating the submission";
      // console.error(`submissions.ctrl.js > 205: ${errmsg}`);
      return res.status(500).json({
        message: errmsg
      });
    } else {
      // console.log("subm.ctrl.js > 201: returning to client");
      // saving to res.locals to make id available for testing
      res.locals.submission_id = updateSubmissionResult[0].id;
      return res
        .status(200)
        .json({ submission_id: updateSubmissionResult[0].id });
    }
  } catch (error) {
    // console.error(`submissions.ctrl.js > 217: ${error}`);
    return res.status(404).json({ message: error.message });
  }
};

/** Delete submission
 *  @param    {String}   id   Id of the submission to delete.
 *  @returns  Success or error message.
 */
const deleteSubmission = async (req, res, next) => {
  let result;
  try {
    result = await submissions.deleteSubmission(req.params.id);
    if (result.message === "Submission deleted successfully") {
      return res.status(200).json({ message: result.message });
    }
    return res.status(500).json({
      message: "An error occurred and the submission was not deleted."
    });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

/** Get all submissions
 *  @returns  {Array|Object}   Array of submission objects OR error message
 */
const getSubmissions = (req, res, next) => {
  return submissions
    .getSubmissions()
    .then(submissions => {
      // for testing
      res.locals.testData = submissions[0];
      return res.status(200).json(submissions);
    })
    .catch(err => res.status(500).json({ message: err.message }));
};

/** Get one submission
 *  @param    {String}   id   Id of the requested submission.
 *  @returns  {Object}        Submission object OR error message.
 */
const getSubmissionById = (req, res, next) => {
  return submissions
    .getSubmissionById(req.params.id)
    .then(submission => {
      if (!submission || submission.message) {
        return res
          .status(404)
          .json({ message: submission.message || "Submission not found" });
      } else {
        // for testing
        res.locals.testData = submission;
        return res.status(200).json(submission);
      }
    })
    .catch(err => res.status(404).json({ message: err.message }));
};

/**
 *
 * @param {String} token captcha token returned to form from google
 * @param {String} ip_address users ipAdress
 * @returns {Bool} returns true for human, false for bot
 */
const verifyHumanity = async (req, res) => {
  // console.log(`verifyHumanity`);
  const { token, ip_address } = req.body;
  const key = process.env.RECAPTCHA_V3_SECRET_KEY;
  return request.post(
    "https://www.google.com/recaptcha/api/siteverify",
    {
      form: {
        secret: key,
        response: token,
        remoteip: ip_address
      }
    },
    (err, httpResponse, body) => {
      if (err) {
        // console.log(`submission.ctrl.js > 287:`);
        // console.log(err);
        return res.status(500).json({ message: err.message });
      } else {
        const r = JSON.parse(body);
        // console.log(`submissions.ctrl.js > 291: recaptcha error:`);
        // console.log(r["error-codes"]);
        if (r.success) {
          // console.log(`submissions.ctrl.js > 297: recaptcha score: ${r.score}`);
          return res.status(200).json({ score: r.score });
        } else {
          // console.log(`submissions.ctrl.js > 300: recaptcha failure`);
          // console.log(r["error-codes"][0]);
          return res.status(500).json({ message: r["error-codes"][0] });
        }
      }
    }
  );
};

/* ================================ EXPORT ================================= */

module.exports = {
  createSubmission,
  updateSubmission,
  deleteSubmission,
  getSubmissionById,
  getSubmissions,
  verifyHumanity
};
