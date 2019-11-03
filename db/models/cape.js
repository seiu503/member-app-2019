// db/models/cape.js

/* ================================= SETUP ================================= */

const uuid = require("uuid");
const { db, TABLES } = require("../../app/config/knex");

/* ============================ PUBLIC METHODS ============================= */

/** Create a CAPE record
 *  @param    {String}   ip_address             IP address
 *  @param    {Timestamp} submission_date       Submission timestamp
 *  @param    {String}   agency_number          Agency number
 *  @param    {String}   cell_phone             Cell phone
 *  @param    {String}   employer_id            Employer id
 *  @param    {String}   first_name             First name
 *  @param    {String}   last_name              Last name
 *  @param    {String}   home_street            Home street
 *  @param    {String}   home_city              Home city
 *  @param    {String}   home_state             Home state
 *  @param    {String}   home_zip               Home zip
 *  @param    {String}   home_email             Home email
 *  @param    {String}   job_title              Occupation
 *  @param    {String}   payment_method         ('Checkoff' || 'Unionisee')
 *  @param    {String}   online_campaign_source Online campaign source
 *  @param    {String}   cape_legal             Legal language
 *  @param    {Number}   cape_amount            Donation amount in $
 *  @param    {String}   cape_status            ('Success' || 'Error')
 *  @param    {String}   cape_errors            Salesforce errors, if any
 *  @param    {String}   donation_frequency     ('Monthly' || 'One-time')
 *  @param    {String}   member_short_id        Unioni.se member shortId

 *  @returns  {Array}    Array of 1 newly-created CAPE Object.
 */

const createCAPE = async (
  ip_address,
  submission_date,
  contact_id,
  first_name,
  last_name,
  home_email,
  cell_phone,
  home_street,
  home_city,
  home_state,
  home_zip,
  job_title,
  employer_id,
  payment_method,
  online_campaign_source,
  cape_legal,
  cape_amount,
  donation_frequency,
  member_short_id,
  cape_status,
  cape_errors
) => {
  return db
    .insert({
      id: uuid.v4(),
      ip_address,
      submission_date,
      contact_id,
      first_name,
      last_name,
      home_email,
      cell_phone,
      home_street,
      home_city,
      home_state,
      home_zip,
      job_title,
      employer_id,
      payment_method,
      online_campaign_source,
      cape_legal,
      cape_amount,
      donation_frequency,
      member_short_id,
      cape_status,
      cape_errors
    })
    .into(TABLES.CAPE)
    .returning("*");
};

/** Update a CAPE record
 *  @param    {String}   id             The id of the CAPE record to update.
 *  @param    {Object}   updates        Key/value pairs of fields to update.
 *  @returns  {Object}      Updated CAPE object.
 */
const updateCAPE = (id, updates) => {
  return db(TABLES.CAPE)
    .where({ id })
    .first()
    .update(updates)
    .update("updated_at", db.fn.now())
    .returning("*");
};

/** Get all CAPE records
 *  @returns   {Array}   Array of CAPE objects.
 */

const getAllCAPE = () => {
  return db(TABLES.CAPE).returning("*");
};

/** Find CAPE by Postgres id
 *  @param    {String}   id   The id of the CAPE object
 *  @returns  {Object}        CAPE Object.
 */

const getCAPEById = id => {
  return db(TABLES.CAPE)
    .where({ id })
    .first()
    .returning("*");
};

/** Find CAPE by Salesforce Contact id
 *  @param    {String}   id   The SF ContactId of the CAPE object
 *  @returns  {Object}        CAPE Object.
 */

const getCAPEBySFId = id => {
  return db(TABLES.CAPE)
    .where({ contact_id: id })
    .first()
    .returning("*");
};

/** Delete CAPE
 *  @param    {String}   id   The id of the CAPE record to delete.
 *  @returns  success message
 */

const deleteCAPE = id => {
  return db(TABLES.CAPE)
    .where({ id })
    .del()
    .then(() => {
      // then return success message to client
      return { message: "CAPE record deleted successfully" };
    });
};

/** Update a CAPE record by one_time_payment_id
 *  @param    {String}   one_time_payment_id    One-time payment id.
 *  @param    {Object}   updates        Key/value pairs of fields to update.
 *              •   one_time_payment_status   : string ('finish' || 'fail')
 *  @returns  {Object}      Success or error message.
 */
const updateCAPEByPaymentId = (one_time_payment_id, updates) => {
  return db(TABLES.CAPE)
    .where({ one_time_payment_id })
    .first()
    .update(updates)
    .update("updated_at", db.fn.now())
    .returning("*");
};

/* ================================ exports ================================ */

module.exports = {
  createCAPE,
  updateCAPE,
  getCAPEById,
  getCAPEBySFId,
  getAllCAPE,
  deleteCAPE,
  updateCAPEByPaymentId
};
