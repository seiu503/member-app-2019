const jsforce = require("jsforce");
const axios = require("axios");
const {
  contactsTableFields,
  submissionsTableFields,
  generateSFContactFieldList,
  generateSFDJRFieldList,
  paymentFields,
  formatDate
} = require("../utils/fieldConfigs");

// setup for sandbox in both dev and prod for now
// switch to production on launch
let loginUrl =
  process.env.NODE_ENV === "production"
    ? "https://test.salesforce.com"
    : "https://test.salesforce.com";

let conn = new jsforce.Connection({ loginUrl });
const user = process.env.SALESFORCE_USER;
const password = process.env.SALESFORCE_PWD;
const fieldList = generateSFContactFieldList();
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
    // console.error(`sf.ctrl.js > 42: ${err}`);
    return res.status(500).json({ message: err.message });
  }
  let contact;
  try {
    contact = await conn.query(query);
    return res.status(200).json(contact.records[0]);
  } catch (err) {
    // console.error(`sf.ctrl.js > 50: ${err}`);
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
    // console.error(`sf.ctrl.js > 82: ${err}`);
    return res.status(500).json({ message: err.message });
  }

  let contact;
  try {
    contact = await conn.sobject("Contact").create({ ...body });
    if (res.locals.next) {
      // console.log(`sf.ctrl.js > 90: returning next`);
      res.locals.sf_contact_id = contact.Id || contact.id;
      return next();
    }
    // console.log(`sf.ctrl.js > 94: returning to client`);
    return res.status(200).json({ salesforce_id: contact.Id || contact.id });
  } catch (err) {
    // console.error(`sf.ctrl.js > 97: ${err}`);
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
  // fuzzy match on first name AND exact match on last name
  // AND exact match on either home OR work email
  // limit one most recently updated record

  if (!first_name || !last_name || !home_email) {
    return res
      .status(500)
      .json({ message: "Please complete all required fields." });
  }

  const query = `SELECT Id, ${fieldList.join(
    ","
  )} FROM Contact WHERE FirstName LIKE \'${first_name}\' AND LastName = \'${last_name}\' AND (Home_Email__c = \'${home_email}\' OR Work_Email__c = \'${home_email}\') ORDER BY LastModifiedDate DESC LIMIT 1`;

  let conn = new jsforce.Connection({ loginUrl });
  try {
    await conn.login(user, password);
  } catch (err) {
    // console.error(`sf.ctrl.js > 131: ${err}`);
    return res.status(500).json({ message: err.message });
  }

  let contact;
  try {
    contact = await conn.query(query);
    if (contact.totalSize === 0 || !contact) {
      // if no contact found, return error message to client
      return res.status(200).json({
        message:
          "Sorry, we could not find a record matching that name and email. Please contact your organizer at 1-844-503-SEIU (7348) for help."
      });
    }
    return res
      .status(200)
      .json({ salesforce_id: contact.records[0].Id || contact.records[0].id });
  } catch (err) {
    // console.error(`sf.ctrl.js > 149: ${err}`);
    return res.status(500).json({ message: err.message });
  }
};

/** Lookup contact in Salesforce, by id if prefill,
 *  otherwise by Firstname, Lastname, & Email.
 *  If existing contact found, update with submission data, then pass id
 *  to next middleware.
 *  If no match found, create new contact and pass id
 *  to next middleware.
 *  @param    {Object}   body         Raw submission data, containing
 *                                    key/value pairs of fields to match/
 *                                    upsert. Minimum fields required to pass
 *                                    SF validation for lookup and potential
 *                                    new contact creation:
 *                                    first_name, last_name, email, employer_id
 *  @returns  {null||Object}          If successful, returns nothing to client
 *                                    but passes object with contact id to
 *                                    next middleware. If failed, returns
 *                                    object with error message to client.
 */

exports.createOrUpdateSFContact = async (req, res, next) => {
  // console.log(`sf.ctrl.js > 173 > createOrUpdateSFContact`);

  const { salesforce_id } = req.body;

  // if contact id is sent in request body, then this is a prefill
  // skip the lookup function and head straight to updateSFContact
  if (salesforce_id) {
    // save contact_id to res.locals to pass to next middleware
    // (it was in the body already but updateSFContact
    // doesn't know to look for it there)
    res.locals.sf_contact_id = salesforce_id;
    res.locals.next = true;

    // console.log(`sf.ctrljs > 186 > found contact id (salesforce_id)`);
    return exports.updateSFContact(req, res, next);
  }

  // otherwise, proceed with lookup:
  const { first_name, last_name, home_email } = req.body;
  // fuzzy match on first name AND exact match on last name
  // AND exact match on either home OR work email
  // limit one most recently updated record

  const query = `SELECT Id, ${fieldList.join(
    ","
  )} FROM Contact WHERE FirstName LIKE \'${first_name}\' AND LastName = \'${last_name}\' AND (Home_Email__c = \'${home_email}\' OR Work_Email__c = \'${home_email}\') ORDER BY LastModifiedDate DESC LIMIT 1`;

  let conn = new jsforce.Connection({ loginUrl });
  try {
    await conn.login(user, password);
  } catch (err) {
    // console.error(`sf.ctrl.js > 204: ${err}`);
    return res.status(500).json({ message: err.message });
  }

  let contact;
  try {
    contact = await conn.query(query);
    if (contact.totalSize === 0 || !contact) {
      // if no contact found, create new contact, then pass id to
      // next middleware in res.locals
      res.locals.next = true;
      // console.log(`sf.ctrl.js > 215: creating new contact`);
      return exports.createSFContact(req, res, next);
    }
    // if contact found, pass contact id to next middleware, which will
    // update it with the submission data from res.body
    if (contact) {
      // console.log(`sf.ctrl.js > 221: found matching contact`);
      res.locals.sf_contact_id = contact.records[0].Id;
      res.locals.next = true;
      return exports.updateSFContact(req, res, next);
    }
  } catch (err) {
    // console.error(`sf.ctrl.js > 227: ${err}`);
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
    // console.error(`sf.ctrl.js > 263: ${err}`);
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

    // console.log(`sf.ctrl.js > 285: returning to client`);
    return res.status(200).json(response);
  } catch (err) {
    // console.error(`sf.ctrl.js > 288: ${err}`);
    return res.status(500).json({ message: err.message });
  }
};

/* +++++++++++++++++++++++++++++ CONTACTS: DELETE ++++++++++++++++++++++++++ */

/** Delete one contact from Salesforce by Salesforce Contact ID
 *  @param    {String}   id   Salesforce Contact ID
 *  @returns  {Object}        Success or error message.
 */
exports.deleteSFContactById = async (req, res, next) => {
  const { id } = req.params;
  let conn = new jsforce.Connection({ loginUrl });
  try {
    await conn.login(user, password);
  } catch (err) {
    // console.error(`sf.ctrl.js > 305: ${err}`);
    return res.status(500).json({ message: err.message });
  }
  try {
    let result = await conn.sobject("Contact").destroy(id);
    return res.status(200).json({ message: "Successfully deleted contact" });
  } catch (err) {
    // console.error(`sf.ctrl.js > 312: ${err}`);
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
  let conn = new jsforce.Connection({ loginUrl });
  try {
    await conn.login(user, password);
  } catch (err) {
    // console.error(`sf.ctrl.js > 331: ${err}`);
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
    // console.error(`sf.ctrl.js > 365: ${err}`);
    return res.status(500).json({ message: err.message });
  }
};

/* +++++++++++++++++++++++++++++ OMA: DELETE +++++++++++++++++++++++++++++++ */

/** Delete OnlineMemberApp by Id
 *  @param    {String}   Id         OMA Id
 *  @returns  {Object}   Success or error message
 */

exports.deleteSFOnlineMemberApp = async (req, res, next) => {
  let conn = new jsforce.Connection({ loginUrl });
  try {
    await conn.login(user, password);
  } catch (err) {
    // console.error(`sf.ctrl.js > 382: ${err}`);
    return res.status(500).json({ message: err.message });
  }

  try {
    const { id } = req.params;
    await conn.sobject("OnlineMemberApp__c").destroy(id);
    return res
      .status(200)
      .json({ message: "Successfully deleted Online Member App" });
  } catch (err) {
    // console.error(`sf.ctrl.js > 393: ${err}`);
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

  const query = `SELECT ${paymentFieldList.join(
    ","
  )}, Id, Employer__c FROM Direct_join_rate__c WHERE Worker__c = \'${id}\'`;
  let conn = new jsforce.Connection({ loginUrl });
  try {
    await conn.login(user, password);
  } catch (err) {
    // console.error(`sf.ctrl.js > 416: ${err}`);
    return res.status(500).json({ message: err.message });
  }
  let djr;
  try {
    djr = await conn.query(query);
    const result = djr.records[0] || {};
    return res.status(200).json(result);
  } catch (err) {
    // console.error(`sf.ctrl.js > 424: ${err}`);
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
    // console.error(`sf.ctrl.js > 449: ${err}`);
    return res.status(500).json({ message: err.message });
  }

  let djr;
  try {
    djr = await conn.sobject("Direct_join_rate__c").create({ ...body });
    // console.log(`sf.ctrl.js > 470: returning to client`);
    return res.status(200).json({ sf_djr_id: djr.Id || djr.id });
  } catch (err) {
    // console.error(`sf.ctrl.js > 473: ${err}`);
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
    // console.error(`sf.ctrl.js > 497: ${err}`);
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
    // console.error(`sf.ctrl.js > 516: ${err}`);
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
  // console.log("getAllEmployers");
  const query = `SELECT Id, Name, Sub_Division__c, Agency_Number__c FROM Account WHERE Id = '0014N00001iFKWWQA4' OR (RecordTypeId = '01261000000ksTuAAI' and Division__c IN ('Retirees', 'Public', 'Care Provider'))`;
  let conn = new jsforce.Connection({ loginUrl });
  try {
    await conn.login(user, password);
  } catch (err) {
    // console.error(`sf.ctrl.js > 521: ${err}`);
    return res.status(500).json({ message: err.message });
  }
  let accounts = [];
  try {
    accounts = await conn.query(query);
    // console.log(`sf.ctrl.js > 527: returning employers to client`);
    if (!accounts || !accounts.records || !accounts.records.length) {
      return res.status(500).json({ message: "Error while fetching accounts" });
    }
    return res.status(200).json(accounts.records);
  } catch (err) {
    // console.error(`sf.ctrl.js > 533: ${err}`);
    return res.status(500).json({ message: err.message });
  }
};

/* =============================== UNIONISE =============================== */

/* +++++++++++++++++++++++++++++++ IFRAMEURL: GET +++++++++++++++++++++++++ */

/** Get an iFrame URL for an existin unionise member by memberShortId
 *  @param        String      memberShortId
 *  @param        String      token
 *  @returns  {String||Object}    cardAddingUrl OR error message.
 */

exports.getIframeExisting = async (req, res, next) => {
  // console.log("getIframeExisting");
  const { memberShortId } = req.body;

  const url = `https://lab.unioni.se/api/v1/members/${memberShortId}/generate-payment-method-iframe-url`;
  const data = {};

  const headers = {
    "content-type": "application/x-www-form-urlencoded",
    Authorization: req.headers.authorization
  };
  // console.log(`sf.ctrl.js > 564`);
  // console.log(headers);

  axios
    .post(url, data, { headers })
    .then(response => {
      // console.log(`sf.ctrl.js > 567`);
      // console.log(response.data);
      if (!response.data || !response.data.cardAddingUrl) {
        return res
          .status(500)
          .json({ message: "Error while fetching card adding iFrame" });
      }
      return res.status(200).json(response.data);
    })
    .catch(err => {
      console.error(`sf.ctrl.js > 588: ${err}`);
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
    password: process.env.UNIONISE_PASSWORD,
    client_id: "unioni.se",
    client_secret: process.env.UNIONISE_CLIENT_SECRET
  };

  const data = Object.entries(params)
    .map(([key, val]) => `${key}=${encodeURIComponent(val)}`)
    .join("&");

  // console.log(data);
  const url =
    "https://auth-dev.unioni.se/auth/realms/lab-api/protocol/openid-connect/token";

  const headers = { "content-type": "application/x-www-form-urlencoded" };
  axios
    .post(url, data, { headers })
    .then(response => {
      // console.log(`sf.ctrl.js > 615`);
      // console.log(response.data);
      if (!response.data || !response.data.access_token) {
        return res
          .status(500)
          .json({ message: "Error while fetching access token" });
      }
      return res.status(200).json(response.data);
    })
    .catch(err => {
      // console.error(`sf.ctrl.js > 617: ${err}`);
      return res.status(500).json({ message: err.message });
    });
};
