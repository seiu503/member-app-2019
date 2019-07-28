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
  console.log("submissions.ctrl.js > 41 createSubmission");
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
    salesforce_id
  } = req.body;

  if (!salesforce_id || salesforce_id === undefined) {
    salesforce_id = res.locals.sf_contact_id;
  }

  console.log("submission.ctrl.js > 74");
  console.log(salesforce_id);

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
    return res.status(422).json({
      reason: "ValidationError",
      message: `Missing required field ${missingField}`
    });
  } else {
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
      console.log(
        `submissions.ctrl.js > 135: ${createSubmissionResult.message ||
          "There was an error saving the submission"}`
      );
      return res.status(500).json({
        message:
          createSubmissionResult.message ||
          "There was an error saving the submission"
      });
    } else {
      console.log("submissions.ctrl.js > 148");
      // passing contact id and submission id to next middleware
      res.locals.sf_contact_id = salesforce_id;
      res.locals.submission_id = createSubmissionResult[0].id;
      console.log(res.locals);
      return next();
    }
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
  try {
    if (!updates || !Object.keys(updates).length) {
      return res.status(404).json({ message: "No updates submitted" });
    }

    if (!id) {
      return res.status(404).json({ message: "No Id Provided in URL" });
    }

    const updateSubmissionResult = await submissions.updateSubmission(
      id,
      updates
    );

    if (!updateSubmissionResult || updateSubmissionResult.message) {
      console.log(
        `submissions.ctrl.js > 176: ${updateSubmissionResult.message ||
          "There was an error updating the submission"}`
      );
      return res.status(500).json({
        message:
          updateSubmissionResult.message ||
          "An error occured while trying to update this submission"
      });
    } else {
      // passing contact id and submission id to next middleware
      res.locals.sf_contact_id = id;
      res.locals.submission_id = updateSubmissionResult[0].id;
      return next();
    }
  } catch (error) {
    return res.status(404).json({ message: "Id missing or malformed" });
  }
};

/** Delete submission
 *  @param    {String}   id   Id of the submission to delete.
 *  @returns  Success or error message.
 */
const deleteSubmission = (req, res, next) => {
  return submissions
    .deleteSubmission(req.params.id)
    .then(result => {
      if (result.message === "Submission deleted successfully") {
        return res.status(200).json({ message: result.message });
      } else {
        return res.status(404).json({
          message: "An error occurred and the submission was not deleted."
        });
      }
    })
    .catch(err => res.status(404).json({ message: err.message }));
};

/** Get all submissions
 *  @returns  {Array|Object}   Array of submission objects OR error message
 */
const getSubmissions = (req, res, next) => {
  return submissions
    .getSubmissions()
    .then(submissions => res.status(200).json(submissions))
    .catch(err => res.status(404).json({ message: err.message }));
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
        res.status(200).json(submission);
      }
    })
    .catch(err => res.status(404).json({ message: err.message }));
};

/* ================================ EXPORT ================================= */

module.exports = {
  createSubmission,
  updateSubmission,
  deleteSubmission,
  getSubmissionById,
  getSubmissions
};
