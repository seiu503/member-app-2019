// const axios = require("axios");
const url = require("url");
const {RecaptchaEnterpriseServiceClient} = require('@google-cloud/recaptcha-enterprise');

/*
   Route handlers for fetching and updating submissions.
*/

/* ================================= SETUP ================================= */

// import models
const submissions = require("../../db/models/submissions");
const utils = require("../utils/index.js");

// can't import this from utils bc it would be a circular import
exports.getClientIp = req =>
  req.headers["x-real-ip"] || req.connection.remoteAddress;

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
exports.createSubmission = async (req, res, next) => {
  const ip = getClientIp(req);
  console.log("submissions.ctrl.js > 45: createSubmission");
  console.log(req.body);
  let {
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
  } = req.body;

  const requiredFields = ["first_name", "last_name", "home_email"];

  if (!submission_date) {
    submission_date = new Date();
  }

  const missingField = requiredFields.find(field => !(field in req.body));
  if (missingField) {
    console.error(`submissions.ctrl.js > 105: missing ${missingField}`);
    return res.status(422).json({
      reason: "ValidationError",
      message: `Missing required field ${missingField}`
    });
  }

  const createSubmissionResult = await submissions
    .createSubmission(
      ip,
      new Date(), // submission date can be datetime
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
    )
    .catch(err => {
      console.error(`submissions.ctrl.js > 129`);
      console.error(err);
      return res.status(500).json({ message: err.message ? err.message : err });
    });

  if (
    !createSubmissionResult ||
    !createSubmissionResult.length ||
    createSubmissionResult.message
  ) {
    console.error(
      `submissions.ctrl.js > 139: ${
        createSubmissionResult && createSubmissionResult.message
          ? createSubmissionResult.message
          : "There was an error saving the submission"
      }`
    );
    return res.status(500).json({
      message:
        createSubmissionResult && createSubmissionResult.message
          ? createSubmissionResult.message
          : "There was an error saving the submission"
    });
  } else {
    res.locals.submission_id = createSubmissionResult[0].id;
    res.locals.currentSubmission = createSubmissionResult[0];
    if (req.locals && req.locals.next) {
      return createSubmissionResult[0].id;
    } else {
      return res.status(200).json({
        salesforce_id,
        submission_id: createSubmissionResult[0].id,
        currentSubmission: createSubmissionResult[0]
      });
    }
  }
};

/** Update a Submission
 *  @param    {String}   id             The id of the submission to update.
 *  @param    {Object}   updates        Key/value pairs of fields to update.
 *  @returns  {Object}      Updated Submission object.
 */
exports.updateSubmission = async (req, res, next) => {
  const updates = req.body;
  delete updates.submission_id;
  let { id } = req.params;
  console.log(`subm.ctrl.js > 169 -- req.params:`);
  console.log(req.params);
  console.log(`subm.ctrl.js > 172 -- req.headers:`);
  console.log(req.headers);
  console.log(`subm.ctrl.js > 171 -- referer:`);
  const referer = req.get("Referrer");
  if (typeof referer === "string") {
    console.log(referer);
  } else {
    console.log(`subm.ctrl.js > 177 -- referer is NOT a string`);
  }

  const queryData = url.parse(
    referer && typeof referer === "string" ? referer : "www.test.com",
    true
  ).query;
  console.log(`subm.ctrl.js > 184 -- queryData:`);
  console.log(queryData);
  if (queryData.submission_id) {
    id = queryData.submission_id;
  }
  if (queryData.salesforce_id) {
    updates.salesforce_id = queryData.salesforce_id;
  }
  // if (updates.checkoff_auth === "on") {
  //   updates.checkoff_auth = new Date();
  // }
  delete updates.checkoff_auth;
  if (updates.terms_agree === "on") {
    updates.terms_agree = true;
  }
  if (updates.scholarship_flag === "on") {
    updates.scholarship_flag = true;
  }
  console.log(`subm.ctrl.js > 202 - id: ${id} (updates below)`);
  console.log(updates);

  if (!updates || !Object.keys(updates).length) {
    console.error("subm.ctrl.js > 206: !updates");
    return res.status(422).json({ message: "No updates submitted" });
  }
  if (!id) {
    console.error("subm.ctrl.js > 210: !id");
    return res.status(422).json({ message: "No Id Provided in URL" });
  }

  const updateSubmissionResult = await submissions
    .updateSubmission(id, updates)
    .catch(err => {
      console.error(`subm.ctrl.js > 217: ${err.message}`);
      return res.status(500).json({
        message: err.message
      });
    });

  if (
    !updateSubmissionResult ||
    (updateSubmissionResult && updateSubmissionResult.message) ||
    updateSubmissionResult.length === 0
  ) {
    const errmsg =
      updateSubmissionResult && updateSubmissionResult.message
        ? updateSubmissionResult.message
        : "There was an error updating the submission";
    console.error(`submissions.ctrl.js > 232: ${errmsg}`);
    return res.status(404).json({
      message: errmsg
    });
  } else if (updateSubmissionResult[0] && updateSubmissionResult[0].id) {
    // console.log("subm.ctrl.js > 201: returning to client");
    // console.log(updateSubmissionResult[0].id);
    // saving to res.locals to make id available for testing
    res.locals.submission_id = updateSubmissionResult[0].id;
    if (req.locals && req.locals.next) {
      console.log("submissions.ctrl.js > 242: updateSubmissionResult");
      console.log(updateSubmissionResult[0]);
      return updateSubmissionResult[0];
    } else {
      return res
        .status(200)
        .json({ submission_id: updateSubmissionResult[0].id });
    }
  }
};

/** Delete submission
 *  @param    {String}   id   Id of the submission to delete.
 *  @returns  Success or error message.
 */
exports.deleteSubmission = async (req, res, next) => {
  let result;
  const userType = req.user.type;
  if (userType != "admin" || !userType) {
    return res.status(500).json({
      message:
        "You do not have permission to access this content. Please consult an administrator."
    });
  }
  try {
    result = await submissions.deleteSubmission(req.params.id);
    if (result.message === "Submission deleted successfully") {
      return res.status(200).json({ message: result.message });
    }
    console.error(`submissions.ctrl.js > 271: ${result.message}`);
    return res.status(500).json({
      message: "An error occurred and the submission was not deleted."
    });
  } catch (err) {
    console.error(`submissions.ctrl.js > 276: ${err.message}`);
    return res.status(500).json({ message: err.message });
  }
};

/** Get all submissions
 *  @returns  {Array|Object}   Array of submission objects OR error message
 */
exports.getSubmissions = (req, res, next) => {
  const userType = req.user.type;
  if (!["admin", "view", "edit"].includes(userType)) {
    return res.status(500).json({
      message:
        "You do not have permission to access this content. Please consult an administrator."
    });
  }
  return submissions
    .getSubmissions()
    .then(submissions => {
      // for testing
      res.locals.testData = submissions[0];
      return res.status(200).json(submissions);
    })
    .catch(err => {
      console.error(`submissions.ctrl.js > 300: ${err.message}`);
      res.status(500).json({ message: err.message });
    });
};

/** Get one submission
 *  @param    {String}   id   Id of the requested submission.
 *  @returns  {Object}        Submission object OR error message.
 */
exports.getSubmissionById = (req, res, next) => {
  const userType = req.user.type;
  if (!["admin", "view", "edit"].includes(userType)) {
    return res.status(500).json({
      message:
        "You do not have permission to access this content. Please consult an administrator."
    });
  }
  return submissions
    .getSubmissionById(req.params.id)
    .then(submission => {
      if (!submission || submission.message) {
        console.error(`submissions.ctrl.js > 321: ${submission.message}`);
        return res
          .status(404)
          .json({ message: submission.message || "Submission not found" });
      } else {
        // for testing
        res.locals.testData = submission;
        return res.status(200).json(submission);
      }
    })
    .catch(err => {
      console.error(`submissions.ctrl.js > 332: ${err.message}`);
      res.status(500).json({ message: err.message });
    });
};
/**
* Create an assessment to analyze the risk of a UI action.
  *
  * projectID: Your Google Cloud Project ID.
  * recaptchaSiteKey: The reCAPTCHA key associated with the site/app
  * token: The generated token obtained from the client.
  * recaptchaAction: Action name corresponding to the token.
  *
*/

exports.verifyHumanity = async (req, res) => {
  console.log("submissions.ctrl.js > 364");
  const projectID = "seiu503-online-membership-form";
  // this gRecaptcha key is attached to the seiu503@gmail.com account
  const recaptchaKey = process.env.GRECAPTCHA_SITEKEY;
  const recaptchaAction = "homepage";
  const { token } = req.body;
  // Create the reCAPTCHA client.
  // TODO: Cache the client generation code (recommended) or call client.close() before exiting the method.
  const client = new RecaptchaEnterpriseServiceClient();
  const projectPath = client.projectPath(projectID);

// Build the assessment request.
  const request = ({
    assessment: {
      event: {
        token: token,
        siteKey: recaptchaKey,
      },
    },
    parent: projectPath,
  });
  const [ response ] = await client.createAssessment(request);
  // console.log('test response data @@@@@@@@@@@@@@@@ submissions.ctrl.js > 371');
  // console.log(response.riskAnalysis);
  // console.log(response.tokenProperties);
 
  // Check if the token is valid.
  if (!response.tokenProperties.valid) {
    console.error(`submissions.ctrl.js > 367`);
    console.log(response.tokenProperties);
    console.log(`The CreateAssessment call failed because the token was: ${response.tokenProperties.invalidReason}`);

    return res.status(500).json({ message: response.tokenProperties.invalidReason });
  }

  // Check if the expected action was executed.
  // The `action` property is set by user client in the grecaptcha.enterprise.execute() method.
 
  if (response.tokenProperties.action === recaptchaAction) {
    // Get the risk score and the reason(s).
    // For more information on interpreting the assessment, see:
    // https://cloud.google.com/recaptcha-enterprise/docs/interpret-assessment
    console.log(`The reCAPTCHA score is: ${response.riskAnalysis.score}`);
    response.riskAnalysis.reasons.forEach((reason) => {
      console.log(reason);
    });
    return res.status(200).json({ score: response.riskAnalysis.score });
  } else {
    console.log("The action attribute in your reCAPTCHA tag does not match the action you are expecting to score");
    return res.status(500).json({ message: "ReCAPTCHA failure, action attribute in reCAPTCHA tag does not match the action" });
  }
};
