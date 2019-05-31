/*
   Route handlers for fetching and updating contacts.
*/

/* ================================= SETUP ================================= */

// import model and mail utilities
const contacts = require("../../db/models/contacts");

/* ============================ ROUTE HANDLERS ============================= */

/** Create A Contact
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
 *  @returns  {Object}    New contact object or error message.
 */
const createContact = (req, res, next) => {
  const {
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
  } = req.body;

  const requiredFields = [
    account_name,
    agency_number,
    first_name,
    last_name,
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
    signature
  ];

  const missingField = requiredFields.find(field => !(field in req.body));

  if (missingField) {
    return res.status(422).json({
      reason: "ValidationError",
      message: "Missing required fields"
    });
  }

  if (!missingField) {
    return contacts
      .createContact(
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
      )
      .then(contacts => {
        const contacts = contacts[0];
        res.status(200).json(contacts);
      })
      .catch(err => {
        console.log(`contacts.ctrl.js > 173: ${err}`);
        res.status(500).json({ message: err.message });
      });
  } else {
    return res
      .status(500)
      .json({ message: "There was an error creating the contact" });
  }
};

/** Update a Contact
 *  @param    {String}   id             The id of the contact to update.
 *  @param    {Object}   updates        Key/value pairs of fields to update.
 *  @returns  {Object}      Updated Contact object.
 */
const updateContact = (req, res, next) => {
  const { updates } = req.body;
  const { id } = req.params;
  if (!updates || !Object.keys(updates).length) {
    return res.status(404).json({ message: "No updates submitted" });
  }

  return contacts
    .updateContact(id, updates)
    .then(contact => {
      if (contact.message || !contact) {
        return res.status(404).json({
          message:
            contact.message ||
            "An error occured while trying to update this contact"
        });
      } else {
        return res.status(200).json(contact);
      }
    })
    .catch(err => res.status(500).json({ message: err.message }));
};

/** Delete contact
 *  @param    {String}   id   Id of the contact to delete.
 *  @returns  Success or error message.
 */
const deleteContact = (req, res, next) => {
  return contacts
    .deleteContact(req.params.id)
    .then(result => {
      if (result.message === "Contact deleted successfully") {
        return res.status(200).json({ message: result.message });
      } else {
        return res.status(404).json({
          message: "An error occurred and the contact was not deleted."
        });
      }
    })
    .catch(err => res.status(404).json({ message: err.message }));
};

/** Get all contacts
 *  @returns  {Array|Object}   Array of contact objects OR error message
 */
const getContacts = () => {
  return contacts
    .getContacts()
    .then(contacts => res.status(200).json(contacts))
    .catch(err => res.status(404).json({ message: err.message }));
};

/** Get one contact
 *  @param    {String}   id   Id of the requested contact.
 *  @returns  {Object}        Contact object OR error message.
 */
const getContactById = (req, res, next) => {
  return contacts
    .getContactById(req.params.id)
    .then(contact => {
      if (!contact || contact.message) {
        return res
          .status(404)
          .json({ message: contact.message || "Contact not found" });
      } else {
        res.status(200).json(contact);
      }
    })
    .catch(err => res.status(404).json({ message: err.message }));
};

/** Get Joined Contact_Submissions by Contact Id
 *
 * @param {String} id   Id of contact to view submissions
 * @returns {Object}    Object of contact and all submissions as an array
 */
const getContactSubmissionsById = (req, res, next) => {
  return contacts
    .getContactSubmissionsById(req.params.id)
    .then(contact_submissions => {
      if (!contact_submissions || contact_submissions.message) {
        return res.status(404).json({
          message:
            contact_submissions.message || "Contact/Submissions not found"
        });
      } else {
        res.status(200).json(contact_submissions);
      }
    })
    .catch(err => res.status(404).json({ message: err.message }));
};

/* ================================ EXPORT ================================= */

module.exports = {
  createContact,
  updateContact,
  deleteContact,
  getContactById,
  getContacts,
  getContactSubmissionsById
};
