var request = require("request");

/*
   Route handlers for fetching and updating cape records.
*/

/* ================================= SETUP ================================= */

// import models
const cape = require("../../db/models/cape");

/* ============================ ROUTE HANDLERS ============================= */

/** Create a CAPE record
 *  @param    {String}   ip_address             IP address
 *  @param    {Timestamp}submission_date        Timestamp
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
 *  @param    {String}   donation_frequency     ('Monthly' || 'One-time')
 *  @param    {String}   member_short_id        Unioni.se member shortId

 *  @returns  {Array}    Array of 1 newly-created CAPE Object.
 */
const createCAPE = async (req, res, next) => {
  // console.log("cape.ctrl.js > 38: createCAPE");
  let {
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
  } = req.body;

  const requiredFields = [
    "ip_address",
    "submission_date",
    "contact_id",
    "first_name",
    "last_name",
    "home_email",
    "cell_phone",
    "home_street",
    "home_city",
    "home_state",
    "home_zip",
    "job_title",
    "employer_id",
    "payment_method",
    "online_campaign_source",
    "cape_legal",
    "cape_amount",
    "donation_frequency",
    "cape_status"
  ];

  const missingField = requiredFields.find(field => !(field in req.body));
  if (missingField) {
    // console.log(`cape.ctrl.js > 86: missing ${missingField}`);
    return res.status(422).json({
      reason: "ValidationError",
      message: `Missing required field ${missingField}`
    });
  }

  const createCAPEResult = await cape.createCAPE(
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
  );

  if (!createCAPEResult || createCAPEResult.message) {
    console.log(
      `cape.ctrl.js > 118: ${createCAPEResult.message ||
        "There was an error saving the CAPE record"}`
    );
    return res.status(500).json({
      message:
        createCAPEResult.message || "There was an error saving the CAPE record"
    });
  } else {
    res.locals.cape_id = createCAPEResult[0].id;
    res.locals.currentCAPE = createCAPEResult[0];
    return res.status(200).json({
      contact_id,
      cape_id: createCAPEResult[0].id,
      currentCAPE: createCAPEResult[0]
    });
  }
};

/** Update a CAPE record
 *  @param    {String}   id             The id of the CAPE record to update.
 *  @param    {Object}   updates        Key/value pairs of fields to update.
 *  @returns  {Object}      Updated CAPE object.
 */
const updateCAPE = async (req, res, next) => {
  const updates = req.body;
  const { id } = req.params;
  // console.log(`cape.ctrl.js > 145 - id: ${id} (updates below)`);
  // console.log(updates);
  try {
    if (!updates || !Object.keys(updates).length) {
      // console.log('cape.ctrl.js > 149: !updates');
      return res.status(422).json({ message: "No updates submitted" });
    }
    if (!id) {
      // console.log('cape.ctrl.js > 153: !id');
      return res.status(422).json({ message: "No Id Provided in URL" });
    }

    const updateCAPEResult = await cape.updateCAPE(id, updates).catch(err => {
      // console.log(`cape.ctrl.js > 160: err`)
      // console.error(err);
    });

    if (
      !updateCAPEResult ||
      updateCAPEResult.message ||
      updateCAPEResult.length === 0
    ) {
      const errmsg =
        updateCAPEResult.message ||
        "There was an error updating the CAPE Record";
      console.error(`cape.ctrl.js > 205: ${errmsg}`);
      return res.status(500).json({
        message: errmsg
      });
    } else {
      // console.log("cape.ctrl.js > 201: returning to client");
      // console.log(updateCAPEResult[0].id);
      // saving to res.locals to make id available for testing
      res.locals.cape_id = updateCAPEResult[0].id;
      return res.status(200).json({ cape_id: updateCAPEResult[0].id });
    }
  } catch (error) {
    // console.error(`cape.ctrl.js > 217: ${error}`);
    return res.status(404).json({ message: error.message });
  }
};

/** Delete CAPE
 *  @param    {String}   id   Id of the CAPE to delete.
 *  @returns  Success or error message.
 */
const deleteCAPE = async (req, res, next) => {
  let result;
  try {
    result = await cape.deleteCAPE(req.params.id);
    if (result.message === "CAPE record deleted successfully") {
      return res.status(200).json({ message: result.message });
    }
    return res.status(500).json({
      message: "An error occurred and the CAPE record was not deleted."
    });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

/** Get all cape
 *  @returns  {Array|Object}   Array of CAPE objects OR error message
 */
const getAllCAPE = (req, res, next) => {
  return cape
    .getAllCAPE()
    .then(cape => {
      // for testing
      res.locals.testData = cape[0];
      return res.status(200).json(cape);
    })
    .catch(err => res.status(500).json({ message: err.message }));
};

/** Get one CAPE record by id
 *  @param    {String}   id   Postgres id of the requested CAPE record.
 *  @returns  {Object}        CAPE object OR error message.
 */
const getCAPEById = (req, res, next) => {
  return cape
    .getCAPEById(req.params.id)
    .then(CAPE => {
      if (!CAPE || (CAPE && CAPE.message)) {
        let message = "CAPE record not found";
        if (CAPE && CAPE.message) {
          message = CAPE.message;
        }
        return res.status(404).json({ message });
      } else {
        // for testing
        res.locals.testData = CAPE;
        return res.status(200).json(CAPE);
      }
    })
    .catch(err => res.status(404).json({ message: err.message }));
};

/** Get one CAPE record by SF Contact id
 *  @param    {String}   id   SF Contact Id of the requested CAPE record.
 *  @returns  {Object}        CAPE object OR error message.
 */
const getCAPEBySFId = (req, res, next) => {
  return cape
    .getCAPEBySFId(req.params.id)
    .then(CAPE => {
      if (!CAPE || (CAPE && CAPE.message)) {
        console.log("cape.ctrl.js > 251: no cape record found");
        let message = "CAPE record not found";
        if (CAPE && CAPE.message) {
          message = CAPE.message;
        }
        return res.status(404).json({ message });
      } else {
        // for testing
        res.locals.testData = CAPE;
        return res.status(200).json(CAPE);
      }
    })
    .catch(err => res.status(404).json({ message: err.message }));
};

/** Update status of a one-time payment request from unioni.se
 *  @param    {String}   id   Payment Id of the requested CAPE record.
 *  @returns  {Object}        Success OR error message.
 */
const updatePaymentStatus = async (req, res, next) => {
  console.log(`cape.ctrl.js > 273`);
  console.log(req.body);
  let one_time_payment_id,
    updates = {};
  if (req.body && req.body.info && req.body.eventType) {
    one_time_payment_id = req.body.info.paymentId;
    updates.one_time_payment_status = req.body.eventType;
  } else {
    if (!req.body.eventType) {
      console.log("cape.ctrl.js > 282: !eventType");
      return res.status(422).json({ message: "No eventType submitted" });
    }
    if (!req.body.info.paymentId) {
      console.log("cape.ctrl.js > 286: !paymentId");
      return res.status(422).json({ message: "No payment Id submitted" });
    }
  }

  console.log(
    `cape.ctrl.js > 277: one_time_payment_id: ${one_time_payment_id} (updates below)`
  );
  console.log(updates);

  try {
    const updateCAPEResult = await cape
      .updateCAPEByPaymentId(one_time_payment_id, updates)
      .catch(err => {
        console.log(`cape.ctrl.js > 291: err`);
        console.error(err);
      });

    if (
      !updateCAPEResult ||
      updateCAPEResult.message ||
      updateCAPEResult.length === 0
    ) {
      const errmsg =
        updateCAPEResult.message ||
        "There was an error updating the CAPE Record";
      console.error(`cape.ctrl.js > 303: ${errmsg}`);
      return res.status(500).json({
        message: errmsg
      });
    } else {
      console.log("cape.ctrl.js > 308: returning to client");
      console.log(updateCAPEResult[0].id);
      // saving to res.locals to make id available for testing
      res.locals.cape_id = updateCAPEResult[0].id;
      return res
        .status(200)
        .json({ message: "Updated payment status successfully" });
    }
  } catch (error) {
    console.error(`cape.ctrl.js > 315: ${error}`);
    return res.status(404).json({ message: error.message });
  }
};

/* ================================ EXPORT ================================= */

module.exports = {
  createCAPE,
  updateCAPE,
  deleteCAPE,
  getCAPEById,
  getCAPEBySFId,
  getAllCAPE,
  updatePaymentStatus
};
