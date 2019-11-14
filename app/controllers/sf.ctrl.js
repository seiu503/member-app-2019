const jsforce = require("jsforce");
const axios = require("axios");
const {
  contactsTableFields,
  submissionsTableFields,
  capeTableFields,
  generateSFContactFieldList,
  generateSFDJRFieldList,
  paymentFields,
  formatDate
} = require("../utils/fieldConfigs");
const utils = require("../utils");

// staging setup for with prod URL/user/pwd for now
// switch to dev when prod deployed
const loginUrl =
  process.env.NODE_CONFIG_ENV === "production"
    ? process.env.SALESFORCE_PROD_URL
    : process.env.SALESFORCE_DEV_URL;

console.log(`sf.ctrl.js > loginUrl: ${loginUrl}`);

let conn = new jsforce.Connection({ loginUrl });

const user =
  process.env.NODE_CONFIG_ENV === "production"
    ? process.env.SALESFORCE_PROD_USER
    : process.env.SALESFORCE_USER;

console.log(`sf.ctrl.js > user: ${user}`);

const password =
  process.env.NODE_CONFIG_ENV === "production"
    ? process.env.SALESFORCE_PROD_PWD
    : process.env.SALESFORCE_PWD;

// console.log(`sf.ctrl.js > password: ${password}`);

const unioniseEndpoint =
  process.env.NODE_CONFIG_ENV === "production"
    ? process.env.UNIONISE_PROD_ENDPOINT
    : process.env.UNIONISE_ENDPOINT;

console.log(`sf.ctrl.js > unioniseEndpoint: ${unioniseEndpoint}`);

const unioniseAuthEndpoint =
  process.env.NODE_CONFIG_ENV === "production"
    ? process.env.UNIONISE_AUTH_PROD_ENDPOINT
    : process.env.UNIONISE_AUTH_ENDPOINT;

console.log(`sf.ctrl.js > unioniseAuthEndpoint: ${unioniseAuthEndpoint}`);

const unionisePassword =
  process.env.NODE_CONFIG_ENV === "production"
    ? process.env.UNIONISE_PROD_PASSWORD
    : process.env.UNIONISE_PASSWORD;

// console.log(`sf.ctrl.js > unionisePassword: ${unionisePassword}`);

const unioniseClientSecret =
  process.env.NODE_CONFIG_ENV === "production"
    ? process.env.UNIONISE_PROD_CLIENT_SECRET
    : process.env.UNIONISE_CLIENT_SECRET;

// console.log(`sf.ctrl.js > unioniseClientSecret: ${unioniseClientSecret}`);

const fieldList = generateSFContactFieldList();
const prefillFieldList = fieldList.filter(field => field !== "Birthdate");
const paymentFieldList = generateSFDJRFieldList();

/* ================================ CONTACTS =============================== */

/* ++++++++++++++++++++++++++++++++ CONTACTS: GET ++++++++++++++++++++++++++ */

/** Fetch one contact from Salesforce by Salesforce Contact ID
 *  @param    {String}   id  	Salesforce Contact ID
 *  @returns  {Object}       	Salesforce Contact object OR error message.
 */
exports.getSFContactById = async (req, res, next) => {
  // console.log(`sf.ctrl.js > getSFContactById`);
  const { id } = req.params;
  const query = `SELECT ${fieldList.join(
    ","
  )}, Id FROM Contact WHERE Id = \'${id}\'`;
  let conn = new jsforce.Connection({ loginUrl });
  try {
    await conn.login(user, password);
  } catch (err) {
    console.error(`sf.ctrl.js > 88: ${err}`);
    return res.status(500).json({ message: err.message });
  }
  let contact;
  try {
    contact = await conn.query(query);
    return res.status(200).json(contact.records[0]);
  } catch (err) {
    console.error(`sf.ctrl.js > 96: ${err}`);
    return res.status(500).json({ message: err.message });
  }
};

/** Fetch one contact from Salesforce, must match Contact ID and Account Id
 *  for data security, do not fetch or prefill contact birthdate
 *  @param    {String}   cId   Salesforce Contact ID
 *  @param    {String}   aId   Salesforce Account ID
 *  @returns  {Object}        Salesforce Contact object OR error message.
 */
exports.getSFContactByDoubleId = async (req, res, next) => {
  // console.log(`sf.ctrl.js > getSFContactByDoubleId`);
  const { cId, aId } = req.params;
  if (!cId || !aId) {
    console.error(`sf.ctrl.js > 111: "Missing required fields"`);
    return res.status(422).json({ message: "Missing required fields" });
  }
  const query = `SELECT ${prefillFieldList.join(
    ","
  )}, Id FROM Contact WHERE Id = \'${cId}\' AND Account.Id = \'${aId}\'`;
  let conn = new jsforce.Connection({ loginUrl });
  try {
    await conn.login(user, password);
  } catch (err) {
    console.error(`sf.ctrl.js > 121: ${err}`);
    return res.status(500).json({ message: err.message });
  }
  let contact;
  try {
    contact = await conn.query(query);
    if (contact.totalSize === 0 || !contact) {
      console.error(`sf.ctrl.js > 135: No matching contact found.`);
      return res.status(404).json({
        message: "No matching contact found."
      });
    }
    return res.status(200).json(contact.records[0]);
  } catch (err) {
    console.error(`sf.ctrl.js > 135: ${err}`);
    return res.status(500).json({ message: err.message });
  }
};

/* +++++++++++++++++++++++++++++++ CONTACTS: POST ++++++++++++++++++++++++++ */

/** Create a new Salesforce Contact
 *  @param    {body}          Full submission data object
 *  @returns  {Object}        { sf_contact_id } or error message
 */
exports.createSFContact = async (req, res, next) => {
  // console.log(`sf.ctrl.js > 62: createSFContact`);

  const bodyRaw = { ...req.body };
  // console.log(`sf.ctrl.js > 64`);
  // console.log(bodyRaw);
  const body = {};

  // convert raw body to key/value pairs using SF API field names
  Object.keys(bodyRaw).forEach(key => {
    if (contactsTableFields[key]) {
      const sfFieldName = contactsTableFields[key].SFAPIName;
      body[sfFieldName] = bodyRaw[key];
    }
  });
  // console.log(`sf.ctrl.js > 74`);
  // console.log(body);
  delete body["Account.Id"];
  delete body["Account.Agency_Number__c"];
  delete body["Account.WS_Subdivision_from_Agency__c"];
  body.AccountId = bodyRaw.employer_id;

  let conn = new jsforce.Connection({ loginUrl });
  try {
    await conn.login(user, password);
  } catch (err) {
    console.error(`sf.ctrl.js > 172: ${err}`);
    return res.status(500).json({ message: err.message });
  }

  let contact;
  try {
    contact = await conn.sobject("Contact").create({ ...body });
    if (res.locals.next) {
      res.locals.sf_contact_id = contact.Id || contact.id;
      return next();
    }
    return res.status(200).json({ salesforce_id: contact.Id || contact.id });
  } catch (err) {
    console.error(`sf.ctrl.js > 185: ${err}`);
    return res.status(500).json({ message: err.message });
  }
};

/* +++++++++++++++++++++++++++++ CONTACTS: LOOKUP ++++++++++++++++++++++++++ */

/** Lookup contact in Salesforce by Firstname, Lastname, & Email.
 *  @param    {Object}   body         first_name, last_name, home_email
 *  @returns  {Object}                sf_contact_id if successful, or returns
 *                                    object with error message to client.
 */

exports.lookupSFContactByFLE = async (req, res, next) => {
  // console.log("lookupSFContactByFLE");
  const { first_name, last_name, home_email } = req.body;

  // fuzzy match on first name OR nickname
  // AND exact match on last name
  // AND exact match on either home OR work email
  // limit one most recently updated record

  if (!first_name || !last_name || !home_email) {
    console.error(`sf.ctrl.js > 206: Missing required fields`);
    return res
      .status(500)
      .json({ message: "Please complete all required fields." });
  }

  const query = `SELECT Id, ${fieldList.join(
    ","
  )} FROM Contact WHERE (FirstName LIKE \'${first_name}\' OR Salutation_Nickname__c LIKE \'${first_name}\') AND LastName = \'${last_name}\' AND (Home_Email__c = \'${home_email}\' OR Work_Email__c = \'${home_email}\') ORDER BY LastModifiedDate DESC LIMIT 1`;

  let conn = new jsforce.Connection({ loginUrl });
  try {
    await conn.login(user, password);
  } catch (err) {
    console.error(`sf.ctrl.js > 220: ${err}`);
    return res.status(500).json({ message: err.message });
  }

  let contact;
  try {
    contact = await conn.query(query);
    if (contact.totalSize === 0 || !contact) {
      // if no contact found, return error message to client
      console.error(`sf.ctrl.js > 97: No matching record found.`);
      return res.status(404).json({
        message: "No matching record found."
      });
    }
    return res.status(200).json({
      salesforce_id: contact.records[0].Id || contact.records[0].id,
      Current_CAPE__c: contact.records[0].Current_CAPE__c
    });
  } catch (err) {
    console.error(`sf.ctrl.js > 239: ${err}`);
    return res.status(500).json({ message: err.message });
  }
};

/* +++++++++++++++++++++++++++++++ CONTACTS: PUT ++++++++++++++++++++++++++ */

/** Update a contact in Salesforce by Salesforce Contact ID
 *  @param    {String}   id           Salesforce Contact ID
 *  @param    {Object}   body         Raw submission data used to generate
 *                                    updates object, containing
 *                                    key/value pairs of fields to be updated.
 *  @returns  {Object}        Salesforce Contact id OR error message.
 */
exports.updateSFContact = async (req, res, next) => {
  // console.log(`sf.ctrl.js > 270: updateSFContact`);
  const { id } = req.params;

  const updatesRaw = { ...req.body };
  const updates = {};
  // convert updates object to key/value pairs using
  // SF API field names
  Object.keys(updatesRaw).forEach(key => {
    if (contactsTableFields[key]) {
      const sfFieldName = contactsTableFields[key].SFAPIName;
      updates[sfFieldName] = updatesRaw[key];
    }
  });
  delete updates["Account.Id"];
  delete updates["Account.Agency_Number__c"];
  delete updates["Account.WS_Subdivision_from_Agency__c"];
  updates.AccountId = updatesRaw.employer_id;

  let conn = new jsforce.Connection({ loginUrl });
  try {
    await conn.login(user, password);
  } catch (err) {
    console.error(`sf.ctrl.js > 276: ${err}`);
    return res.status(500).json({ message: err.message });
  }
  let contact;
  try {
    contact = await conn.sobject("Contact").update({
      Id: id,
      ...updates
    });
    if (res.locals.next) {
      // console.log(`sf.ctrl.js > 273: returning next`);
      return next();
    }

    let response = {
      salesforce_id: id
    };
    if (res.locals.submission_id) {
      response.submission_id = res.locals.submission_id;
    }
    // console.log(response);

    return res.status(200).json(response);
  } catch (err) {
    console.error(`sf.ctrl.js > 300: ${err}`);
    return res.status(500).json({ message: err.message });
  }
};

/* ======================== ONLINE MEMBER APPS (OMA) ======================= */

/* +++++++++++++++++++++++++++++++ OMA: POST +++++++++++++++++++++++++++++++ */

/** Create an OnlineMemberApps object in Salesforce with submission data
 *  @param    {Object}   body         Submission object
 *  @returns  does not return to client; passes salesforce_id to next function
 */

exports.createSFOnlineMemberApp = async (req, res, next) => {
  const ip = utils.getClientIp(req);
  console.log(`sf.ctrl.js > 332: ${ip}`);
  let conn = new jsforce.Connection({ loginUrl });
  try {
    await conn.login(user, password);
  } catch (err) {
    console.error(`sf.ctrl.js > 319: ${err}`);
    return res.status(500).json({ message: err.message });
  }

  let oma;
  try {
    const bodyRaw = { ...req.body };
    const body = {};
    Object.keys(bodyRaw).forEach(key => {
      if (submissionsTableFields[key]) {
        const sfFieldName = submissionsTableFields[key].SFAPIName;
        body[sfFieldName] = bodyRaw[key];
      }
    });
    delete body["Account.Id"];
    delete body["Account.Agency_Number__c"];
    delete body["Account.WS_Subdivision_from_Agency__c"];
    delete body["Birthdate"];
    body.Birthdate__c = bodyRaw.birthdate;
    body.Worker__c = bodyRaw.Worker__c;
    body.IP_Address__c = ip;
    // console.log(`sf.ctrl.js > 347`);
    // console.log(body);

    OMA = await conn.sobject("OnlineMemberApp__c").create({
      ...body
    });

    return res.status(200).json({
      salesforce_id: res.locals.sf_contact_id,
      submission_id: res.locals.submission_id,
      sf_OMA_id: OMA.id || OMA.Id
    });
  } catch (err) {
    console.error(`sf.ctrl.js > 352: ${err}`);
    return res.status(500).json({ message: err.message });
  }
};

/* ======================== DIRECT JOIN RATES (DJR) ======================== */

/* +++++++++++++++++++++++++++++++ DJR: GET ++++++++++++++++++++++++++++++++ */

/** Get one Direct Join Rate record from Salesforce by Salesforce Contact ID
 *  @param    {String}   id   Salesforce Contact ID
 *  @returns  {Object}        Salesforce Direct Join Rate object OR error msg.
 */
exports.getSFDJRById = async (req, res, next) => {
  // console.log(`sf.ctrl.js > getSFDJRById`);
  const { id } = req.params;
  // console.log(`sf.ctrl.js > ############# getSFDJRById`);
  // console.log(paymentFieldList);
  // console.log(id);
  const query = `SELECT ${paymentFieldList.join(
    ","
  )}, LastModifiedDate, Id, Employer__c FROM Direct_join_rate__c WHERE Worker__c = \'${id}\' ORDER BY LastModifiedDate DESC LIMIT 1`;
  let conn = new jsforce.Connection({ loginUrl });
  try {
    await conn.login(user, password);
  } catch (err) {
    console.error(`sf.ctrl.js > 378: ${err}`);
    return res.status(500).json({ message: err.message });
  }
  let djr;
  try {
    djr = await conn.query(query);
    const result = djr.records[0] || {};
    return res.status(200).json(result);
  } catch (err) {
    console.error(`sf.ctrl.js > 387: ${err}`);
    return res.status(500).json({ message: err.message });
  }
};

/* ++++++++++++++++++++++++++++++ DJR: POST ++++++++++++++++++++++++++++++++ */

/** Create a new Salesforce Direct Join Rate record
 *  @param    {body}   Payment fields object:
 *                       Worker__c (salesforceId) REQUIRED (others optional)
 *                       Unioni_se_MemberID__c (memberShortId)
 *                       Payment_Method__c (paymentMethod)
 *                       AFH_Number_of_Residents__c (medicaidResidents)
 *  @returns  {Object}        { sf_djr_id } or error message
 */
exports.createSFDJR = async (req, res, next) => {
  // console.log(`sf.ctrl.js > 440: createSFDJR`);
  const body = { ...req.body };
  // console.log(body);

  let conn = new jsforce.Connection({ loginUrl });
  try {
    await conn.login(user, password);
  } catch (err) {
    console.error(`sf.ctrl.js > 411: ${err}`);
    return res.status(500).json({ message: err.message });
  }

  let djr;
  try {
    djr = await conn.sobject("Direct_join_rate__c").create({ ...body });
    // console.log(`sf.ctrl.js > 470: returning to client`);
    return res.status(200).json({ sf_djr_id: djr.Id || djr.id });
  } catch (err) {
    console.error(`sf.ctrl.js > 421: ${err}`);
    return res.status(500).json({ message: err.message });
  }
};

/* ++++++++++++++++++++++++++++++ DJR: PUT +++++++++++++++++++++++++++++++++ */

/** Update a DJR record in Salesforce by Salesforce Contact ID
 *  @param    {String}   id           Salesforce Contact ID
 *  @param    {Object}   body         Raw paymentFields data used to generate
 *                                    updates object, containing
 *                                    key/value pairs of fields to be updated.
 *  @returns  {Object}        Salesforce DJR id OR error message.
 */
exports.updateSFDJR = async (req, res, next) => {
  // console.log(`sf.ctrl.js > 488: updateSFDJR`);
  const { id } = req.params;
  const updates = { ...req.body };
  updates.Id = id;

  let conn = new jsforce.Connection({ loginUrl });
  try {
    await conn.login(user, password);
  } catch (err) {
    console.error(`sf.ctrl.js > 445: ${err}`);
    return res.status(500).json({ message: err.message });
  }
  let djr;
  try {
    djr = await conn.sobject("Direct_join_rate__c").update({
      ...updates
    });
    if (res.locals.next) {
      // console.log(`sf.ctrl.js > 506: returning next`);
      return next();
    }

    let response = { sf_djr_id: djr.id || djr.Id };
    res.locals.sf_djr_id = djr.id || djr.Id;

    // console.log(`sf.ctrl.js > 346: returning to client`);
    return res.status(200).json(response);
  } catch (err) {
    console.error(`sf.ctrl.js > 464: ${err}`);
    return res.status(500).json({ message: err.message });
  }
};

/* ================================== CAPE ================================= */

/* +++++++++++++++++++++++++++++++ CAPE: POST ++++++++++++++++++++++++++++++ */

/** Create a CAPE object in Salesforce with submission data
 *  @param    {Object}   body         Submission object
 *  @returns  success or error message
 */

exports.createSFCAPE = async (req, res, next) => {
  let conn = new jsforce.Connection({ loginUrl });
  try {
    await conn.login(user, password);
  } catch (err) {
    console.error(`sf.ctrl.js > 483: ${err}`);
    return res.status(500).json({ message: err.message });
  }

  let cape;
  try {
    const bodyRaw = { ...req.body };
    const body = {};
    Object.keys(bodyRaw).forEach(key => {
      if (capeTableFields[key] && capeTableFields[key].SFAPIName) {
        const sfFieldName = capeTableFields[key].SFAPIName;
        body[sfFieldName] = bodyRaw[key];
      }
    });

    // convert datetime to yyyy-mm-dd format
    body.Submission_Date__c = formatDate(new Date(bodyRaw.submission_date));

    // console.log(`################# sf.ctrl.js > 517 (createSFCAPE body)`);
    // console.log(body);

    CAPE = await conn.sobject("CAPE__c").create({
      ...body
    });

    return res.status(200).json({
      sf_cape_id: CAPE.id || CAPE.Id
    });
  } catch (err) {
    console.error(`sf.ctrl.js > 512: ${err}`);
    return res.status(500).json({ message: err.message });
  }
};

/* +++++++++++++++++++++++++++++++ CAPE: PUT ++++++++++++++++++++++++++++++ */

/** Update SFCAPE record with one-time payment id (from app)
    or status (from unioni.se)
    handles two different request types, differentiated by shape of body
 *  @param  {Body shape 1}   {
 *            info {
 *              paymentRequestId    : string   Unioni.se payment request id,
 *              errorCode    : string   ('InvalidCard', 'CardDeclined',
 *                                        'AccountNotFound',
 *                                        'InsufficientBalance', 'Unknown')
 *            },
 *            eventType      : string   payment status ('finish' || 'fail')
 *           }
 *
 *          {Body shape 2}   {
 *             Id                      : string  sObject Id of CAPE__c object,
 *             One_Time_Payment_Id__c  : string  Unioni.se one-time payment id,
 *             Active_Account_Last_4__c: string  last 4 digits of card used,
 *             Card_Brand__c           : string  brand of card used
 *            }
 *
 *  @returns  {Object}        Success OR error message.
 */
exports.updateSFCAPE = async (req, res, next) => {
  console.log(`sf.ctrl.js > 584: updateSFCAPE`);
  console.log(req.body);
  let match_id;
  // check if this is Body shape 1 (request from unioni.se)
  if (req.body && req.body.info) {
    match_id = req.body.info.paymentRequestId;
    if (!req.body.eventType) {
      console.error("sf.ctrl.js > 547: !eventType");
      return res.status(422).json({ message: "No eventType submitted" });
    }
    // for unioni.se event types other than 'payment', return 200 and
    // skip updating SF CAPE record
    if (req.body.category !== "payment") {
      return res
        .status(200)
        .json({ message: "Ignoring non-payment event type" });
    }
    // check if this is Body shape 2 (request from member app)
  } else if (req.body && req.body.Id) {
    match_id = req.body.Id;
  }
  if (!match_id) {
    console.error("sf.ctrl.js > 566: !paymentRequestId or !CAPE__c Id");
    return res
      .status(422)
      .json({ message: "No payment request Id (or CAPE__c Id) submitted" });
  }

  let conn = new jsforce.Connection({ loginUrl });
  try {
    await conn.login(user, password);
  } catch (err) {
    console.error(`sf.ctrl.js > 576: ${err}`);
    return res.status(500).json({ message: err.message });
  }

  let capeResult;
  if (req.body && req.body.info) {
    // this is a request from unioni.se.
    // find the CAPE__c record with matching payment id,
    // then update it with payment status
    const errorCode = req.body.info.errorCode || "";
    try {
      capeResult = await conn
        .sobject("CAPE__c")
        .find({ One_Time_Payment_Id__c: req.body.info.paymentRequestId })
        .update({
          One_Time_Payment_Status__c: req.body.eventType,
          One_Time_Payment_Errors__c: errorCode
        });

      // console.log("sf.ctrl.js > 631: returning to client");
      // console.log(capeResult[0]);
      let error;

      if (!capeResult[0] || !capeResult[0].success) {
        error = `No matching record found for paymentRequestId ${
          req.body.info.paymentRequestId
        }`;

        if (capeResult[0] && capeResult[0].errors) {
          error += `, ${capeResult[0].errors[0]}`;
          console.error(`sf.ctrl.js > 618: ${capeResult[0].errors}`);
        }
        return res.status(404).json({ message: error });
      }
      // saving to res.locals to make id available for testing
      res.locals.sf_cape_id = capeResult.Id;
      return res
        .status(200)
        .json({ message: "Updated payment status successfully" });
    } catch (error) {
      const message =
        error.message || "There was an error updating the CAPE Record";
      console.error(`sf.ctrl.js > 615: ${error}`);
      return res.status(404).json({ message });
    }
  } else if (req.body && req.body.Id) {
    // this is a request from the member app.
    // find the CAPE__c record with matching sObject Id,
    // then update it with unioni.se one time payment id
    try {
      capeResult = await conn.sobject("CAPE__c").update({
        Id: req.body.Id,
        One_Time_Payment_Id__c: req.body.One_Time_Payment_Id__c,
        Active_Account_Last_4__c: req.body.Active_Account_Last_4__c,
        Card_Brand__c: req.body.Card_Brand__c
      });

      let error;
      if (!capeResult || !capeResult.success) {
        error = `No matching record found for CAPE sObject Id ${req.body.Id}`;
        if (capeResult && capeResult.errors) {
          error += `, ${capeResult.errors[0]}`;
          console.error(`sf.ctrl.js > 633: ${error}`);
        }

        return res.status(404).json({ message: error });
      }
      // saving to res.locals to make id available for testing
      res.locals.sf_cape_id = capeResult.id || capeResult.Id;
      // console.log('sf.ctrl.js > 688');
      // console.log(res.locals.sf_cape_id);
      return res
        .status(200)
        .json({ message: "Updated CAPE record successfully" });
    } catch (error) {
      const message =
        error.message || "There was an error updating the CAPE Record";
      console.error(`sf.ctrl.js > 648: ${error}`);
      return res.status(404).json({ message });
    }
  }
};

/** GET SFCAPE record by SF Contact ID
 *  @param  {string} id
 *  @returns  {Object}        Success OR error message.
 */
exports.getSFCAPEByContactId = async (req, res, next) => {
  const { id } = req.params;
  const query = `SELECT Active_Account_Last_4__c, Payment_Error_Hold__c, Unioni_se_MemberID__c, Card_Brand__c, LastModifiedDate, Id, Employer__c FROM CAPE__c WHERE Worker__c = \'${id}\' ORDER BY LastModifiedDate DESC LIMIT 1`;
  let conn = new jsforce.Connection({ loginUrl });
  try {
    await conn.login(user, password);
  } catch (err) {
    console.error(`sf.ctrl.js > 686: ${err}`);
    return res.status(500).json({ message: err.message });
  }
  let cape;
  try {
    cape = await conn.query(query);
    const result = cape.records[0] || {};
    return res.status(200).json(result);
  } catch (err) {
    console.error(`sf.ctrl.js > 695: ${err}`);
    return res.status(500).json({ message: err.message });
  }
};

/* =============================== ACCOUNTS =============================== */

/* +++++++++++++++++++++++++++++++ ACCOUNTS: GET ++++++++++++++++++++++++++ */

/** Get an array of all employers from Salesforce
 *  @param    {none}
 *  @returns  {Array||Object}    Array of SF Account objects OR error message.
 */
exports.getAllEmployers = async (req, res, next) => {
  console.log(`sf.ctrl.js > 724`);
  console.log("getAllEmployers");
  // 0014N00001iFKWWQA4 = Community Members Account Id
  // 0016100000PZDmOAAX = SEIU 503 Staff Account Id
  // (these 2 do not fit the query in any other way
  // so have to be SELECTed for separately)
  // const query = `SELECT Id, Name, Sub_Division__c, Parent.Id, Agency_Number__c FROM Account WHERE Id = '0014N00001iFKWWQA4' OR Id = '0016100000PZDmOAAX' OR (RecordTypeId = '01261000000ksTuAAI' AND Division__c IN ('Retirees', 'Public', 'Care Provider') AND Sub_Division__c != null)`;
  const query = `SELECT Id, Name, Sub_Division__c, Parent.Id, Agency_Number__c FROM Account WHERE Id = '0016100000PZDmOAAX' OR (RecordTypeId = '01261000000ksTuAAI' AND Division__c IN ('Retirees', 'Public', 'Care Provider') AND Sub_Division__c != null)`;
  let conn = new jsforce.Connection({ loginUrl });
  try {
    await conn.login(user, password);
  } catch (err) {
    console.error(`sf.ctrl.js > 720: ${err}`);
    return res.status(500).json({ message: err.message });
  }
  let accounts = [];
  try {
    accounts = await conn.query(query);
    if (!accounts || !accounts.records || !accounts.records.length) {
      console.log(`sf.ctrl.js > 728: returning employers to client`);
      return res.status(500).json({ message: "Error while fetching accounts" });
    }
    console.log(`sf.ctrl.js > 730: returning employers to client`);
    return res.status(200).json(accounts.records);
  } catch (err) {
    console.error(`sf.ctrl.js > 733: ${err}`);
    return res.status(500).json({ message: err.message });
  }
};

/* =============================== UNIONISE =============================== */

/* +++++++++++++++++++++++++++++++ IFRAMEURL: POST +++++++++++++++++++++++++ */

/** Get an iFrame URL for an existing unionise member by memberShortId
 *  @param        String      memberShortId
 *  @param        String      token
 *  @returns  {String||Object}    cardAddingUrl OR error message.
 */

exports.getIframeExisting = async (req, res, next) => {
  // console.log("getIframeExisting");
  const { memberShortId } = req.body;

  const url = `${unioniseEndpoint}/api/v1/members/${memberShortId}/generate-payment-method-iframe-url`;
  const data = {};

  const headers = {
    "content-type": "application/x-www-form-urlencoded",
    Authorization: req.headers.authorization
  };
  // console.log(`sf.ctrl.js > 723: ${url}`);
  // console.log(headers);

  axios
    .post(url, data, { headers })
    .then(response => {
      // console.log(`sf.ctrl.js > 729`);
      // console.log(response.data);
      if (!response.data || !response.data.cardAddingUrl) {
        console.error(
          `########### sf.ctrl.js > 732: Error while fetching card adding iFrame`
        );
        return res
          .status(500)
          .json({ message: "Error while fetching card adding iFrame" });
      }
      return res.status(200).json(response.data);
    })
    .catch(err => {
      console.error(`######### sf.ctrl.js > 740: ${err}`);
      return res.status(500).json({ message: err.message });
    });
};

/* ++++++++++++++++++++++++++++++ ACCESS TOKEN: GET ++++++++++++++++++++++++ */

/** Get unionise access token to access secured routes
 *  @param        None
 *  @returns  {Object}    access_token OR error message.
 */

exports.getUnioniseToken = async (req, res, next) => {
  // console.log("getUnioniseToken");

  const params = {
    grant_type: "password",
    username: "seiu503",
    password: unionisePassword,
    client_id: "unioni.se",
    client_secret: unioniseClientSecret
  };

  const data = Object.entries(params)
    .map(([key, val]) => `${key}=${encodeURIComponent(val)}`)
    .join("&");

  // console.log(data);
  const url = unioniseAuthEndpoint;

  const headers = { "content-type": "application/x-www-form-urlencoded" };
  axios
    .post(url, data, { headers })
    .then(response => {
      // console.log(`sf.ctrl.js > 774`);
      // console.log(response.data);
      if (!response.data || !response.data.access_token) {
        console.error(`sf.ctrl.js > 777: Error while fetching access token`);
        return res
          .status(500)
          .json({ message: "Error while fetching access token" });
      }
      return res.status(200).json(response.data);
    })
    .catch(err => {
      console.error(`sf.ctrl.js > 785: ${err}`);
      return res.status(500).json({ message: err.message });
    });
};

/* +++++++++++++++++++++++++++ ONE-TIME PAYMENT: POST +++++++++++++++++++++ */

/** Post a request to process a one-time payment (CAPE contribution)
 *  @param    {Object}   body
 ****  memberShortId       : String
 ****  amount: {
 ****    currency          : String  // ('USD')
 ****    amount            : Numeric // (1.1)
 ****  },
 ****  paymentPartType     : String  // ('CAPE')
 ****  description         : String  // ('One-time CAPE contribution')
 ****  plannedDatetime     : Timestamp // 2019-09-10T17:20:44.143+03:00
 *  @returns  {Object}   payment request id or error message
 *  {
      id: String // ('a07dbd65-9f34-40e6-a203-5406302b8c75')
    }
 */

exports.postPaymentRequest = async (req, res, next) => {
  // console.log("postPaymentRequest");

  const data = { ...req.body };

  // console.log(data);
  // console.log(req.headers.authorization);
  const url = `${unioniseEndpoint}/api/v1/paymentRequests`;

  const headers = {
    "content-type": "application/json",
    Authorization: req.headers.authorization
  };
  axios
    .post(url, data, { headers })
    .then(response => {
      // console.log(`sf.ctrl.js > 851`);
      // console.log(response);
      if (!response.data || !response.data.id) {
        console.error(`sf.ctrl.js > 811:`);
        console.error(response);
        return res
          .status(500)
          .json({ message: "Error while posting payment request" });
      }
      return res.status(200).json(response.data);
    })
    .catch(err => {
      console.error(`sf.ctrl.js > 820: ${err}`);
      return res.status(500).json({ message: err.message });
    });
};
