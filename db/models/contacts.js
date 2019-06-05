// db/models/contacts.js

/* ================================= SETUP ================================= */

const uuid = require("uuid");
const { db, TABLES } = require("../../app/config/knex");

/* ============================ PUBLIC METHODS ============================= */

/** Create a Contact
 * @param    {String}   display_name                  New contact full name for prefill modal display (only populated on SF prefills)
 * @param    {String}   account_name                  New contact Employer name
 * @param    {String}   agency_number                 New contact Agency number
 * @param    {String}   mail_to_city                  New contact Mail City
 * @param    {String}   mail_to_state                 New contact Mail State
 * @param    {String}   mail_to_street                New contact Mail Street
 * @param    {String}   mail_to_postal_code           New contact Mail ZIP
 * @param    {String}   first_name                    New contact First name
 * @param    {String}   last_name                     New contact Last name
 * @param    {String}   dd                            New contact dd
 *** (partial entry for DOB, concatenated on client, not written to SF)
 * @param    {String}   mm                            New contact mm
 *** (partial entry for DOB, concatenated on client, not written to SF)
 * @param    {String}   yyyy                          New contact yyyy
 *** (partial entry for DOB, concatenated on client, not written to SF)
 * @param    {String}   dob                           New contact Birthdate
 *** (concatenated on client from 3 partial strings, saved to SF)
 * @param    {String}   preferred_language            New contact Preferred Language
 * @param    {String}   home_street                   New contact Home street
 * @param    {String}   home_postal_code              New contact Home ZIP
 * @param    {String}   home_state                    New contact Home state
 * @param    {String}   home_city                     New contact Home city
 * @param    {String}   home_email                    New contact Home email
 * @param    {String}   mobile_phone                  New contact Mobile phone
 * @param    {Boolean}  text_auth_opt_out             New contact Text authorization opt out
 * @param    {Boolean}  terms_agree                   New contact Agreement to membership terms
 * @param    {String}   signature                     New contact URL of Signature Image
 * @param    {String}   online_campaign_source        New contact Online Campaign Source
 * @param    {Boolean}   signed_application           New contact Signed Online Application
 * @param    {String}   ethnicity                     New contact Ethnicity
 * @param    {Boolean}  lgbtq_id                      New contact LGBTQIA+ ID
 * @param    {Boolean}  trans_id                      New contact Trans ID
 * @param    {Boolean}  disability_id                 New contact Disability ID
 * @param    {Boolean}  deaf_or_hard_of_hearing       New contact Deaf/HoH ID
 * @param    {Boolean}  blind_or_visually_impaired    New contact Blind ID
 * @param    {String}   gender                        New contact Gender
 * @param    {String}   gender_other_description      New contact Gender other description
 * @param    {String}   gender_pronoun                New contact Pronouns
 * @param    {String}   job_title                     New contact Job Title
 * @param    {Date}     hire_date                     New contact Hire Date
 * @param    {String}   worksite                      New contact Worksite
 * @param    {String}   work_email                    New contact Work Email
 * @returns {Array} Array of 1 newly-created Contact Object.
 */
const createContact = (
  display_name,
  account_name,
  agency_number,
  mail_to_city,
  mail_to_state,
  mail_to_street,
  mail_to_postal_code,
  first_name,
  last_name,
  dd,
  mm,
  yyyy,
  dob,
  preferred_language,
  home_street,
  home_postal_code,
  home_state,
  home_city,
  home_email,
  mobile_phone,
  text_auth_opt_out,
  terms_agree,
  signature,
  online_campaign_source,
  signed_application,
  ethnicity,
  lgbtq_id,
  trans_id,
  disability_id,
  deaf_or_hard_of_hearing,
  blind_or_visually_impaired,
  gender,
  gender_other_description,
  gender_pronoun,
  job_title,
  hire_date,
  worksite,
  work_email
) => {
  return db
    .insert({
      contact_id: uuid.v4(),
      display_name,
      account_name,
      agency_number,
      mail_to_city,
      mail_to_state,
      mail_to_street,
      mail_to_postal_code,
      first_name,
      last_name,
      dd,
      mm,
      yyyy,
      dob,
      preferred_language,
      home_street,
      home_postal_code,
      home_state,
      home_city,
      home_email,
      mobile_phone,
      text_auth_opt_out,
      terms_agree,
      signature,
      online_campaign_source,
      signed_application,
      ethnicity,
      lgbtq_id,
      trans_id,
      disability_id,
      deaf_or_hard_of_hearing,
      blind_or_visually_impaired,
      gender,
      gender_other_description,
      gender_pronoun,
      job_title,
      hire_date,
      worksite,
      work_email
    })
    .into(TABLES.CONTACTS)
    .returning("*");
};

/** Update a Contact
 *  @param    {String}   contact_id     The id of the contact to update.
 *  @param    {Object}   updates        Key/value pairs of fields to update.
 *  @returns  {Object}   Updated Contact object.
 */
const updateContact = (contact_id, updates) => {
  return db(TABLES.CONTACTS)
    .where({ contact_id })
    .first()
    .update(updates)
    .update("updated_at", db.fn.now())
    .returning("*");
};

/** Get all Contacts
 *  @returns   {Array}   Array of contact objects.
 */

const getContacts = () => {
  return db(TABLES.CONTACTS).returning("*");
};

/** Find a Contact by id
 *  @param    {String}   contact_id   The id of the contact to delete.
 *  @returns  success message
 */

const getContactById = contact_id => {
  return db(TABLES.CONTACTS)
    .where({ contact_id })
    .first()
    .returning("*");
};

/** Delete Contact
 *  @param    {String}   contact_id   The id of the Contact to delete.
 *  @returns  success message
 */

const deleteContact = contact_id => {
  return db(TABLES.CONTACTS)
    .where({ contact_id })
    .del()
    .then(() => {
      // then return success message to client
      return { message: "Contact deleted successfully" };
    });
};

/** Create entry in join table for Contacts and Submissions
 * @param   {String}   contact_id     primary id of contact
 * @param   {String}   submission_id  primary id of submission
 * @returns {Object}   Joined contact and submission object
 */

const attachContactSubmission = (contact_id, submission_id) => {
  return db
    .insert({ id: uuid.v4(), contact_id, submission_id })
    .into(TABLES.CONTACTS_SUBMISSIONS)
    .returning("*");
};

/** Get results from join table with an array of all submissions for a given contact
 * @param {String} id primary id of contact
 * @returns {Object} Object with contact_id and an array of all associated submissions
 */

const getContactSubmissionsById = id => {
  return db
    .select(`${TABLES.CONTACTS}.*`, `${TABLES.SUBMISSIONS}.*`)
    .from(TABLES.CONTACTS)
    .leftJoin(
      TABLES.CONTACTS_SUBMISSIONS,
      `${TABLES.CONTACTS_SUBMISSIONS}.contact_id`,
      `${TABLES.CONTACTS}.contact_id`
    )
    .leftJoin(
      TABLES.SUBMISSIONS,
      `${TABLES.CONTACTS_SUBMISSIONS}.submission_id`,
      `${TABLES.SUBMISSIONS}.submission_id`
    )
    .where(`${TABLES.CONTACTS}.contact_id`, id)
    .then(results => {
      return results.reduce((memo, submission) => {
        if (!memo.submissions) {
          memo.submissions = [];
        }
        memo.submissions.push(submission.submission_id);
        return memo;
      }, {});
    });
};

/* ================================ exports ================================ */

module.exports = {
  createContact,
  updateContact,
  getContactById,
  getContacts,
  deleteContact,
  attachContactSubmission,
  getContactSubmissionsById
};
