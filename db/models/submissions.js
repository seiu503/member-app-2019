// db/models/users.js

/* ================================= SETUP ================================= */

const uuid = require("uuid");
const { db, TABLES } = require("../../app/config/knex");

/* ============================ PUBLIC METHODS ============================= */

/** Create a Submission
 * @param  {String} display_name                  New Submission display_name
 * @param  {String} account_name                  New Submission account_name
 * @param  {String} agency_number                 New Submission agency_number
 * @param  {String} mail_to_city                  New Submission mail_to_city
 * @param  {String} mail_to_state                 New Submission mail_to_state
 * @param  {String} mail_to_street                New Submission mail_to_street
 * @param  {String} mail_to_postal_code           New Submission mail_to_postal_code
 * @param  {String} first_name                    New Submission first_name
 * @param  {String} last_name                     New Submission last_name
 * @param  {String} dd                            New Submission dd
 * @param  {String} mm                            New Submission mm
 * @param  {String} yyyy                          New Submission yyyy
 * @param  {String} dob                           New Submission dob
 * @param  {String} preferred_language            New Submission preferred_language
 * @param  {String} home_street                   New Submission home_street
 * @param  {String} home_postal_code              New Submission home_postal_code
 * @param  {String} home_state                    New Submission home_state
 * @param  {String} home_city                     New Submission home_city
 * @param  {String} home_email                    New Submission home_email
 * @param  {String} mobile_phone                  New Submission mobile_phone
 * @param  {String} text_auth_opt_out             New Submission text_auth_opt_out
 * @param  {String} terms_agree                   New Submission terms_agree
 * @param  {String} signature                     New Submission signature
 * @param  {String} online_campaign_source        New Submission online_campaign_source
 * @param  {String} signed_application            New Submission signed_application
 * @param  {String} ethnicity                     New Submission ethnicity
 * @param  {String} lgbtq_id                      New Submission lgbtq_id
 * @param  {String} trans_id                      New Submission trans_id
 * @param  {String} disability_id                 New Submission disability_id
 * @param  {String} deaf_or_hard_of_hearing       New Submission deaf_or_hard_of_hearing
 * @param  {String} blind_or_visually_impaired    New Submission blind_or_visually_impaired
 * @param  {String} gender                        New Submission gender
 * @param  {String} gender_other_description      New Submission gender_other_description
 * @param  {String} gender_pronoun                New Submission gender_pronoun
 * @param  {String} job_title                     New Submission job_title
 * @param  {String} hire_date                     New Submission hire_date
 * @param  {String} worksite                      New Submission worksite
 * @param  {String} work_email                    New Submission work_email
 * @returns {Array} Array of 1 newly-created Submission Object.
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
 ****  @param  {String} display_name                  Updated display_name
 ****  @param  {String} account_name                  Updated account_name
 ****  @param  {String} agency_number                 Updated agency_number
 ****  @param  {String} mail_to_city                  Updated mail_to_city
 ****  @param  {String} mail_to_state                 Updated mail_to_state
 ****  @param  {String} mail_to_street                Updated mail_to_street
 ****  @param  {String} mail_to_postal_code           Updated mail_to_postal_code
 ****  @param  {String} first_name                    Updated first_name
 ****  @param  {String} last_name                     Updated last_name
 ****  @param  {String} dd                            Updated dd
 ****  @param  {String} mm                            Updated mm
 ****  @param  {String} yyyy                          Updated yyyy
 ****  @param  {String} dob                           Updated dob
 ****  @param  {String} preferred_language            Updated preferred_language
 ****  @param  {String} home_street                   Updated home_street
 ****  @param  {String} home_postal_code              Updated home_postal_code
 ****  @param  {String} home_state                    Updated home_state
 ****  @param  {String} home_city                     Updated home_city
 ****  @param  {String} home_email                    Updated home_email
 ****  @param  {String} mobile_phone                  Updated mobile_phone
 ****  @param  {String} text_auth_opt_out             Updated text_auth_opt_out
 ****  @param  {String} terms_agree                   Updated terms_agree
 ****  @param  {String} signature                     Updated signature
 ****  @param  {String} online_campaign_source        Updated online_campaign_source
 ****  @param  {String} signed_application            Updated signed_application
 ****  @param  {String} ethnicity                     Updated ethnicity
 ****  @param  {String} lgbtq_id                      Updated lgbtq_id
 ****  @param  {String} trans_id                      Updated trans_id
 ****  @param  {String} disability_id                 Updated disability_id
 ****  @param  {String} deaf_or_hard_of_hearing       Updated deaf_or_hard_of_hearing
 ****  @param  {String} blind_or_visually_impaired    Updated blind_or_visually_impaired
 ****  @param  {String} gender                        Updated gender
 ****  @param  {String} gender_other_description      Updated gender_other_description
 ****  @param  {String} gender_pronoun                Updated gender_pronoun
 ****  @param  {String} job_title                     Updated job_title
 ****  @param  {String} hire_date                     Updated hire_date
 ****  @param  {String} worksite                      Updated worksite
 ****  @param  {String} work_email                    Updated work_email
 *  @returns  {Object}   Updated Submission object.
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

/** Find a Submission by id
 *  @param    {String}   id   The id of the Submission to delete.
 *  @returns  success message
 */

const getSubmissionById = id => {
  return db(TABLES.SUBMISSIONS)
    .where({ id })
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
  getSubmissionById,
  getSubmissions,
  deleteSubmission
};
