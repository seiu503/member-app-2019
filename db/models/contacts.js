// db/models/users.js

/* ================================= SETUP ================================= */

const uuid = require("uuid");
const { db, TABLES } = require("../../app/config/knex");

/* ============================ PUBLIC METHODS ============================= */

/** Create a Contact
 * @param    {String}   display_name                  New contact display_name
 * @param    {String}   account_name                  New contact account_name
 * @param    {String}   agency_number                 New contact agency_number
 * @param    {String}   mail_to_city                  New contact mail_to_city
 * @param    {String}   mail_to_state                 New contact mail_to_state
 * @param    {String}   mail_to_street                New contact mail_to_street
 * @param    {String}   mail_to_postal_code           New contact mail_to_postal_code
 * @param    {String}   first_name                    New contact first_name
 * @param    {String}   last_name                     New contact last_name
 * @param    {String}   dd                            New contact dd
 * @param    {String}   mm                            New contact mm
 * @param    {String}   yyyy                          New contact yyyy
 * @param    {String}   dob                           New contact dob
 * @param    {String}   preferred_language            New contact preferred_language
 * @param    {String}   home_street                   New contact home_street
 * @param    {String}   home_postal_code              New contact home_postal_code
 * @param    {String}   home_state                    New contact home_state
 * @param    {String}   home_city                     New contact home_city
 * @param    {String}   home_email                    New contact home_email
 * @param    {String}   mobile_phone                  New contact mobile_phone
 * @param    {String}   text_auth_opt_out             New contact text_auth_opt_out
 * @param    {String}   terms_agree                   New contact terms_agree
 * @param    {String}   signature                     New contact signature
 * @param    {String}   online_campaign_source        New contact online_campaign_source
 * @param    {String}   signed_application            New contact signed_application
 * @param    {String}   ethnicity                     New contact ethnicity
 * @param    {String}   lgbtq_id                      New contact lgbtq_id
 * @param    {String}   trans_id                      New contact trans_id
 * @param    {String}   disability_id                 New contact disability_id
 * @param    {String}   deaf_or_hard_of_hearing       New contact deaf_or_hard_of_hearing
 * @param    {String}   blind_or_visually_impaired    New contact blind_or_visually_impaired
 * @param    {String}   gender                        New contact gender
 * @param    {String}   gender_other_description      New contact gender_other_description
 * @param    {String}   gender_pronoun                New contact gender_pronoun
 * @param    {String}   job_title                     New contact job_title
 * @param    {String}   hire_date                     New contact hire_date
 * @param    {String}   worksite                      New contact worksite
 * @param    {String}   work_email                    New contact work_email
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
 ****  @param    {String}   display_name                  Updated display_name
 ****  @param    {String}   account_name                  Updated account_name
 ****  @param    {String}   agency_number                 Updated agency_number
 ****  @param    {String}   mail_to_city                  Updated mail_to_city
 ****  @param    {String}   mail_to_state                 Updated mail_to_state
 ****  @param    {String}   mail_to_street                Updated mail_to_street
 ****  @param    {String}   mail_to_postal_code           Updated mail_to_postal_code
 ****  @param    {String}   first_name                    Updated first_name
 ****  @param    {String}   last_name                     Updated last_name
 ****  @param    {String}   dd                            Updated dd
 ****  @param    {String}   mm                            Updated mm
 ****  @param    {String}   yyyy                          Updated yyyy
 ****  @param    {String}   dob                           Updated dob
 ****  @param    {String}   preferred_language            Updated preferred_language
 ****  @param    {String}   home_street                   Updated home_street
 ****  @param    {String}   home_postal_code              Updated home_postal_code
 ****  @param    {String}   home_state                    Updated home_state
 ****  @param    {String}   home_city                     Updated home_city
 ****  @param    {String}   home_email                    Updated home_email
 ****  @param    {String}   mobile_phone                  Updated mobile_phone
 ****  @param    {String}   text_auth_opt_out             Updated text_auth_opt_out
 ****  @param    {String}   terms_agree                   Updated terms_agree
 ****  @param    {String}   signature                     Updated signature
 ****  @param    {String}   online_campaign_source        Updated online_campaign_source
 ****  @param    {String}   signed_application            Updated signed_application
 ****  @param    {String}   ethnicity                     Updated ethnicity
 ****  @param    {String}   lgbtq_id                      Updated lgbtq_id
 ****  @param    {String}   trans_id                      Updated trans_id
 ****  @param    {String}   disability_id                 Updated disability_id
 ****  @param    {String}   deaf_or_hard_of_hearing       Updated deaf_or_hard_of_hearing
 ****  @param    {String}   blind_or_visually_impaired    Updated blind_or_visually_impaired
 ****  @param    {String}   gender                        Updated gender
 ****  @param    {String}   gender_other_description      Updated gender_other_description
 ****  @param    {String}   gender_pronoun                Updated gender_pronoun
 ****  @param    {String}   job_title                     Updated job_title
 ****  @param    {String}   hire_date                     Updated hire_date
 ****  @param    {String}   worksite                      Updated worksite
 ****  @param    {String}   work_email                    Updated work_email
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
 *  @returns   {Array}   Array of user objects.
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
    .insert({ contact_id, submission_id })
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
