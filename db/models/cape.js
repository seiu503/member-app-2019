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
 *  @param    {String}   paymentMethod          ('Checkoff' || 'Unionisee')
 *  @param    {String}   online_campaign_source Online campaign source
 *  @param    {String}   cape_legal             Legal language
 *  @param    {Number}   capeAmount             Donation amount in $
 *  @param    {String}   donationFrequency      ('Monthly' || 'One-time')
 *  @param    {String}   memberShortId          Unioni.se member shortId

 *  @returns  {Array}    Array of 1 newly-created CAPE Object.
 */

const createCape = (
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
  agency_number,
  paymentMethod,
  online_campaign_source,
  cape_legal,
  capeAmount,
  donationFrequency,
  memberShortId
) => {
  return db
    .insert({
      id: uuid.v4(),
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
      agency_number,
      paymentMethod,
      online_campaign_source,
      cape_legal,
      capeAmount,
      donationFrequency,
      memberShortId
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

/** Find CAPE by id
 *  @param    {String}   id   The id of the CAPE object
 *  @returns  {Object}        CAPE Object.
 */

const getCAPEById = id => {
  return db(TABLES.CAPE)
    .where({ id })
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

/* ================================ exports ================================ */

module.exports = {
  createCAPE,
  updateCAPE,
  getCAPEById,
  getAllCAPE,
  deleteCAPE
};
