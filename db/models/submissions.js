// db/models/users.js

/* ================================= SETUP ================================= */

const uuid = require("uuid");
const { db, TABLES } = require("../../app/config/knex");

/* ============================ PUBLIC METHODS ============================= */

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
 *  @param    {String}   salesforce_id             salesforce id
 *  @param    {String}   legal_language         Dynamic dump of html legal language on form at time of submision
 *  @param    {Date}  maintenance_of_effort     Date of submission; confirmation of MOE checkbox
 *  @param    {Date}   seiu503_cba_app_date     Date of submission; confirmation of submitting membership form
 *  @param    {Date}   direct_pay_auth          Date of submission; confirmation of direct pay authorization
 *  @param    {Date}   direct_deposit_auth      Date of submission; confirmation of direct deposit authorization
 *  @param    {String}   immediate_past_member_status   Immediate past member status (populated from SF for existing contact matches)
 *  @returns  {Array}    Array of 1 newly-created Submission Object.
 */

const createSubmission = (
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
) => {
  return db
    .insert({
      id: uuid.v4(),
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
    })
    .into(TABLES.SUBMISSIONS)
    .returning("*");
};

/** Update a Submission
 *  @param    {String}   id             The id of the submission to update.
 *  @param    {Object}   updates        Key/value pairs of fields to update.
 *  @returns  {Object}      Updated Submission object.
 */
const updateSubmission = (id, updates) => {
  return db(TABLES.SUBMISSIONS)
    .where({ id })
    .first()
    .update(updates)
    .update("updated_at", db.fn.now())
    .returning("*");
};

/** Get all SUBMISSIONS
 *  @returns   {Array}   Array of Submission objects.
 */

const getSubmissions = () => {
  return db(TABLES.SUBMISSIONS).returning("*");
};

/** Find Submission by id
 *  @param    {String}   id   The id of the Submission to delete.
 *  @returns  {Object}                   Submission Object.
 */

const getSubmissionById = id => {
  return db(TABLES.SUBMISSIONS)
    .where({ id })
    .first()
    .returning("*");
};

/** Find Submissions by salesforce_id
 *  @param    {String}   salesforce_id   The id of the Submission to delete.
 *  @returns  {Array}                 Array of all submissions for given contact.
 */

const getSubmissionsBySalesforceId = salesforce_id => {
  return db(TABLES.SUBMISSIONS)
    .where({ salesforce_id })
    .first()
    .returning("*");
};

/** Delete Submission
 *  @param    {String}   id   The id of the Submission to delete.
 *  @returns  success message
 */

const deleteSubmission = id => {
  return db(TABLES.SUBMISSIONS)
    .where({ id })
    .del()
    .then(() => {
      // then return success message to client
      return { message: "Submission deleted successfully" };
    });
};

/* ================================ exports ================================ */

module.exports = {
  createSubmission,
  updateSubmission,
  getSubmissionById,
  getSubmissionsBySalesforceId,
  getSubmissions,
  deleteSubmission
};
