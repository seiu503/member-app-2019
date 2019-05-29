// db/models/users.js

/* ================================= SETUP ================================= */

const uuid = require("uuid");
const { db, TABLES } = require("../../app/config/knex");

/* ============================ PUBLIC METHODS ============================= */

/** Create a Submission
 *  @param    {String}   ip_address                     New Submission ip_address
 *  @param    {String}   submission_date                New Submission submission_date
 *  @param    {String}   agency_number                  New Submission agency_number
 *  @param    {String}   birthdate                      New Submission birthdate
 *  @param    {String}   cell_phone                     New Submission cell_phone
 *  @param    {String}   employer_name                  New Submission employer_name
 *  @param    {String}   first_name                     New Submission first_name
 *  @param    {String}   last_name                      New Submission last_name
 *  @param    {String}   home_street                    New Submission home_street
 *  @param    {String}   home_city                      New Submission home_city
 *  @param    {String}   home_state                     New Submission home_state
 *  @param    {String}   home_zip                       New Submission home_zip
 *  @param    {String}   home_email                     New Submission home_email
 *  @param    {String}   preferred_language             New Submission preferred_language
 *  @param    {String}   terms_agree                    New Submission terms_agree
 *  @param    {String}   signature                      New Submission signature
 *  @param    {String}   text_auth_opt_out              New Submission text_auth_opt_out
 *  @param    {String}   online_campaign_source         New Submission online_campaign_source
 *  @param    {String}   contact_id                     New Submission contact_id
 *  @param    {String}   legal_language                 New Submission legal_language
 *  @param    {String}   maintenance_of_effort          New Submission maintenance_of_effort
 *  @param    {String}   seiu503_cba_app_date           New Submission seiu503_cba_app_date
 *  @param    {String}   direct_pay_auth                New Submission direct_pay_auth
 *  @param    {String}   direct_deposit_auth            New Submission direct_deposit_auth
 *  @param    {String}   immediate_past_member_status   New Submission immediate_past_member_status
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
  contact_id,
  legal_language,
  maintenance_of_effort,
  seiu503_cba_app_date,
  direct_pay_auth,
  direct_deposit_auth,
  immediate_past_member_status
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
      contact_id,
      legal_language,
      maintenance_of_effort,
      seiu503_cba_app_date,
      direct_pay_auth,
      direct_deposit_auth,
      immediate_past_member_status
    })
    .into(TABLES.SUBMISSIONS)
    .returning("*");
};

/** Update a Submission
 *  @param    {String}   id             The id of the user to update.
 *  @param    {Object}   updates        Key/value pairs of fields to update.
 ****  @param    {String}   ip_address                     New Submission ip_address
 ****  @param    {String}   submission_date                New Submission submission_date
 ****  @param    {String}   agency_number                  New Submission agency_number
 ****  @param    {String}   birthdate                      New Submission birthdate
 ****  @param    {String}   cell_phone                     New Submission cell_phone
 ****  @param    {String}   employer_name                  New Submission employer_name
 ****  @param    {String}   first_name                     New Submission first_name
 ****  @param    {String}   last_name                      New Submission last_name
 ****  @param    {String}   home_street                    New Submission home_street
 ****  @param    {String}   home_city                      New Submission home_city
 ****  @param    {String}   home_state                     New Submission home_state
 ****  @param    {String}   home_zip                       New Submission home_zip
 ****  @param    {String}   home_email                     New Submission home_email
 ****  @param    {String}   preferred_language             New Submission preferred_language
 ****  @param    {String}   terms_agree                    New Submission terms_agree
 ****  @param    {String}   signature                      New Submission signature
 ****  @param    {String}   text_auth_opt_out              New Submission text_auth_opt_out
 ****  @param    {String}   online_campaign_source         New Submission online_campaign_source
 ****  @param    {String}   contact_id                     New Submission contact_id
 ****  @param    {String}   legal_language                 New Submission legal_language
 ****  @param    {String}   maintenance_of_effort          New Submission maintenance_of_effort
 ****  @param    {String}   seiu503_cba_app_date           New Submission seiu503_cba_app_date
 ****  @param    {String}   direct_pay_auth                New Submission direct_pay_auth
 ****  @param    {String}   direct_deposit_auth            New Submission direct_deposit_auth
 ****  @param    {String}   immediate_past_member_status   New Submission immediate_past_member_status
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
 *  @returns   {Array}   Array of user objects.
 */

const getSubmissions = () => {
  return db(TABLES.SUBMISSIONS).returning("*");
};

/** Find Submission by submission_id
 *  @param    {String}   submission_id   The id of the Submission to delete.
 *  @returns  {Object}                   Submission Object.
 */

const getSubmissionsByContactId = submission_id => {
  return db(TABLES.SUBMISSIONS)
    .where({ submission_id })
    .first()
    .returning("*");
};

/** Find Submissions by contact_id
 *  @param    {String}   contact_id   The id of the Submission to delete.
 *  @returns  {Array}                 Array of all submissions for given contact.
 */

const getSubmissionsByContactId = contact_id => {
  return db(TABLES.SUBMISSIONS)
    .where({ contact_id })
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
      return { message: "Contact deleted successfully" };
    });
};

/* ================================ exports ================================ */

module.exports = {
  createSubmission,
  updateSubmission,
  getSubmissionsByContactId,
  getSubmissions,
  deleteSubmission
};
