const jsforce = require("jsforce");
const axios = require("axios");
const uuid = require("uuid");
const {
  contactsTableFields,
  submissionsTableFields,
  capeTableFields,
  generateSFContactFieldList,
  paymentFields,
  formatDate
} = require("../utils/fieldConfigs");
const utils = require("../utils");
const submissionCtrl = require("../controllers/submissions.ctrl.js");

const CLIENT_URL =
  process.env.NODE_CONFIG_ENV === "production"
    ? process.env.APP_HOST_PROD
    : process.env.NODE_CONFIG_ENV === "staging"
    ? process.env.APP_HOST_STAGING
    : process.env.CLIENT_URL;

// staging setup for with prod URL/user/pwd for now
// switch to dev when prod deployed
const loginUrl =
  process.env.NODE_CONFIG_ENV === "production"
    ? process.env.SALESFORCE_PROD_URL
    : process.env.SALESFORCE_DEV_URL;

// console.log(`sf.ctrl.js > loginUrl: ${loginUrl}`);

let conn = new jsforce.Connection({ loginUrl });

const user =
  process.env.NODE_CONFIG_ENV === "production"
    ? process.env.SALESFORCE_PROD_USER
    : process.env.SALESFORCE_USER;

// console.log(`sf.ctrl.js > user: ${user}`);

const password =
  process.env.NODE_CONFIG_ENV === "production"
    ? process.env.SALESFORCE_PROD_PWD
    : process.env.SALESFORCE_PWD;

// console.log(`sf.ctrl.js > password: ${password}`);

const fieldList = generateSFContactFieldList();
const prefillFieldList = fieldList.filter(field => field !== "Birthdate");

// can't import these funcs from utils bc circular imports
exports.getClientIp = req =>
  req.headers["x-real-ip"] || req.connection.remoteAddress;

exports.formatSFDate = date => {
  let d = new Date(date),
    month = "" + (d.getMonth() + 1),
    day = "" + d.getDate(),
    year = d.getFullYear();

  if (month.length < 2) month = "0" + month;
  if (day.length < 2) day = "0" + day;

  return [year, month, day].join("-");
};

// find matching employer object from SF Employers array returned from API
exports.findEmployerObject = (employerObjects, employerName) =>
  employerObjects
    ? employerObjects.filter(obj => {
        if (employerName.toLowerCase() === "community member") {
          return obj.Name.toLowerCase() === "community members";
        }
        return obj.Name.toLowerCase() === employerName.toLowerCase();
      })[0]
    : { Name: "" };

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
  // console.log(`sf.ctrl.js > 148: createSFContact`);

  const bodyRaw = { ...req.body };
  // console.log(`sf.ctrl.js > 151, req.body`);
  // console.log(bodyRaw);
  const body = {};

  // convert raw body to key/value pairs using SF API field names
  Object.keys(bodyRaw).forEach(key => {
    if (contactsTableFields[key]) {
      const sfFieldName = contactsTableFields[key].SFAPIName;
      body[sfFieldName] = bodyRaw[key];
    }
  });
  // console.log(`sf.ctrl.js > 162, body`);
  // console.log(body);
  delete body["Account.Id"];
  delete body["Account.Agency_Number__c"];
  delete body["Account.WS_Subdivision_from_Agency__c"];
  body.AccountId = bodyRaw.employer_id;
  // console.log("sf.ctrl.js > 168, body");
  // console.log(body);
  let conn = new jsforce.Connection({ loginUrl });
  try {
    await conn.login(user, password);
  } catch (err) {
    console.error(`sf.ctrl.js > 190: ${err}`);
    return res.status(500).json({ message: err.message });
  }

  let contact;
  try {
    contact = await conn.sobject("Contact").create({ ...body });
    if (req.locals && req.locals.next) {
      console.log(`sf.ctrl.js > 198: returning next`);
      console.log(`sf_contact_id: ${contact.Id || contact.id}`);
      res.locals.sf_contact_id = contact.Id || contact.id;
      return contact.Id || contact.id;
    } else {
      return res.status(200).json({ salesforce_id: contact.Id || contact.id });
    }
  } catch (err) {
    console.error(`sf.ctrl.js > 206: ${err}`);
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
    console.error(req.body);
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
      if (req.locals && req.locals.next) {
        console.log(`sf.ctrl.js > 236: NEXT`);
        return null;
      } else {
        return res.status(404).json({
          message: "No matching record found."
        });
      }
    }
    if (req.locals && req.locals.next) {
      console.log(`sf.ctrl.js > 245: NEXT`);

      return {
        salesforce_id: contact.records[0].Id || contact.records[0].id,
        Current_CAPE__c: contact.records[0].Current_CAPE__c
      };
    } else {
      return res.status(200).json({
        salesforce_id: contact.records[0].Id || contact.records[0].id,
        Current_CAPE__c: contact.records[0].Current_CAPE__c
      });
    }
  } catch (err) {
    console.error(`sf.ctrl.js > 259: ${err}`);
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
  // console.log(`sf.ctrl.js > 286: updates`);
  // console.log(updatesRaw);
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
  if (updates.Birthdate__c) {
    updates.Birthdate__c = this.formatSFDate(updates.birthdate);
  }
  // don't make any changes to contact account/employer
  // updates.AccountId = updatesRaw.employer_id;
  // console.log(`sf.ctrl.js > 276: UPDATE SFCONTACT updates`);
  // console.log(updates);

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
    if (req.locals && req.locals.next) {
      console.log(`sf.ctrl.js > 313: returning next`);
      return id;
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
  const ip = this.getClientIp(req);
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
    console.log("sf.ctrl.js > 391 OMA submission body raw");
    console.log(bodyRaw);
    const body = {};
    Object.keys(bodyRaw).forEach(key => {
      if (submissionsTableFields[key]) {
        const sfFieldName = submissionsTableFields[key].SFAPIName;
        if (sfFieldName) {
          body[sfFieldName] = bodyRaw[key];
        }
      }
    });
    // console.log(
    //   `sf.ctrl.js: 403: bodyRaw.agency_number: ${bodyRaw.agency_number}`
    // );
    // console.log(
    //   `sf.ctrl.js: 406: body.Agency_Number_from_Webform__c: ${body.Agency_Number_from_Webform__c}`
    // );
    // console.log(`sf.ctrl.js: 382: body.Birthdate: ${body.Birthdate}`);
    delete body["Account.Id"];
    delete body["Account.Agency_Number__c"];
    delete body["Account.WS_Subdivision_from_Agency__c"];
    delete body["Birthdate"];
    delete body["agencyNumber__c"];
    // console.log(`sf.ctrl.js: 390: bodyRaw.birthdate: ${bodyRaw.birthdate}`);
    // body.Birthdate__c = this.formatSFDate(bodyRaw.birthdate);
    body.Birthdate__c = new Date(bodyRaw.birthdate).toISOString();
    // console.log(`sf.ctrl.js: 394: body.Birthdate__c: ${body.Birthdate__c}`);
    body.Submission_Date__c = new Date(); // this one can be a datetime
    body.Worker__c = bodyRaw.Worker__c
      ? bodyRaw.Worker__c
      : bodyRaw.salesforce_id;
    body.IP_Address__c = ip;
    // console.log(`sf.ctrl.js > 421: body.Worker__c: ${body.Worker__c}`);
    // body.Checkoff_Auth__c = this.formatSFDate(body.Checkoff_Auth__c);
    if (
      bodyRaw.scholarship_flag === "on" ||
      bodyRaw.scholarship_flag === true ||
      bodyRaw.scholarship_flag === "true" ||
      bodyRaw.scholarship_flag === "True"
    ) {
      body.Scholarship_Flag__c = true;
    } else {
      body.Scholarship_Flag__c = false;
    }
    console.log(`sf.ctrl.js > 433: sfOMA body cleaned`);
    console.log(body);

    OMA = await conn.sobject("OnlineMemberApp__c").create({
      ...body
    });

    if (req.locals && req.locals.next) {
      return OMA.id || OMA.Id;
    } else {
      return res.status(200).json({
        salesforce_id: res.locals.sf_contact_id,
        submission_id: res.locals.submission_id,
        sf_OMA_id: OMA.id || OMA.Id
      });
    }
  } catch (err) {
    console.error(`sf.ctrl.js > 450: ${err}`);
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
    // console.log(`createSFCAPE body (sf.ctrl.js > 501)`);
    // console.log(bodyRaw);
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

/* =============================== ACCOUNTS =============================== */

/* +++++++++++++++++++++++++++++++ ACCOUNTS: GET ++++++++++++++++++++++++++ */

/** Get an array of all employers from Salesforce
 *  @param    {none}
 *  @returns  {Array||Object}    Array of SF Account objects OR error message.
 */
exports.getAllEmployers = async (req, res, next) => {
  console.log(`sf.ctrl.js > getAllEmployers 489`);
  // 0014N00001iFKWWQA4 = Community Members Account Id
  // 0016100000PZDmOAAX = SEIU 503 Staff Account Id
  // 0016100000Pw3aKAAR = Child Care Acct Id
  // 0016100000Pw3XQAAZ = AFH Account Id, 0016100001UoDg2AAF = AFH Parent Acct Id
  // 0016100000TOfXsAAL = Retirees Acct Id, 0016100001UoDg2AAF = Retiree Parent Acct Id
  // 0016100001UoDg2AAF = Generic Parent
  // 01261000000ksTuAAI = Record type ID for Agency level employer
  // (Community members & Staff do not fit the query in any other way
  // so have to be SELECTed for separately)

  // query below includes community, afh, retirees, child care
  // const query = `SELECT Id, Name, Sub_Division__c, Parent.Id, Agency_Number__c FROM Account WHERE Id = '0014N00001iFKWWQA4' OR (RecordTypeId = '01261000000ksTuAAI' AND Division__c IN ('Retirees', 'Public', 'Care Provider') AND Sub_Division__c != null)`;

  // query below explicitly excludes community, afh, retirees, child care
  const query = `SELECT Id, Name, Sub_Division__c, Parent.Id, Agency_Number__c FROM Account WHERE RecordTypeId = '01261000000ksTuAAI' AND Division__c IN ('Retirees', 'Public', 'Care Provider') AND Sub_Division__c != null AND Agency_Number__c != null AND Id != '0014N00001iFKWWQA4' AND Id != '0016100000Pw3XQAAZ' AND Id != '0016100000TOfXsAAL' AND Id !='0016100000Pw3aKAAR'`;
  console.log(`sf.ctrl.js > getAllEmployers > conn.login url 505: ${loginUrl}`);
  let conn = new jsforce.Connection({ loginUrl });
  try {
    console.log(`sf.ctrl.js > getAllEmployers > conn.login try block 507`);
    await conn.login(user, password);
  } catch (err) {
    console.log(`sf.ctrl.js > getAllEmployers > conn.login catch block 510`);
    console.error(`sf.ctrl.js > 510: ${err}`);
    return res.status(500).json({ message: err.message });
  }
  let accounts = [];
  try {
    accounts = await conn.query(query);
    if (!accounts || !accounts.records || !accounts.records.length) {
      console.log(
        `sf.ctrl.js > 517: getAllEmployers conn.query > error fetching accounts`
      );
      return res.status(500).json({ message: "Error while fetching accounts" });
    }
    if (req.locals && req.locals.next) {
      console.log(
        `sf.ctrl.js > 521: getAllEmployers conn.query returning next`
      );
      return accounts.records;
    } else {
      console.log(
        `sf.ctrl.js > 524: getAllEmployers conn.query returning employers to client`
      );
      // console.log(accounts.records);
      return res.status(200).json(accounts.records);
    }
  } catch (err) {
    console.error(`sf.ctrl.js > 529: getAllEmployers conn.query ${err}`);
    return res.status(500).json({ message: err.message });
  }
};

// updated April 1 2021 for no-js form
const legal_language = `<div><h3>Membership Authorization</h3><p>I request and voluntarily accept membership in SEIU Local 503 and its successors or assigns (collectively “Local 503”). This means I will receive the benefits and abide by the obligations of membership set forth in both Local 503’s and the Service Employees International Union’s Constitutions and Bylaws. I authorize Local 503 to act as my representative in collective bargaining over wages, benefits, and other terms/conditions of employment with my employer, and as my exclusive representative where authorized by law. My membership will be continuous, unless I resign by providing notice to Local 503 via U.S. mail (or other method if permitted by Local 503 policies). I know that union membership is voluntary and not a condition of employment, and that I can decline to join without reprisal.</p><h3>Dues Deduction/Checkoff Authorization</h3><p>I request and voluntarily authorize my employer to deduct from my earnings and to pay to Local 503 and its successors and assigns (collectively “Local 503”) an amount equal to Local 503’s regular dues. This dues deduction authorization shall remain in effect unless I revoke it by providing notice to Local 503 via U.S. mail (or other method if permitted by Local 503’s policies) within 15 days before or after (1) the annual anniversary date of this agreement or (2) the termination of the applicable collective bargaining agreement between my employer and union (“my window periods”). This authorization will renew automatically from year to year even if I have resigned my membership, unless I revoke it during one of my window periods and as required by Local 503’s policies. This authorization is voluntary and is not a condition of my employment, and I can decline to agree to it without reprisal. I understand that all members benefit from everyone’s commitments because they help build a strong union that is able to plan for the future.</p></div>`;

/* +++++++++++++++++++++++++ NO-JS METHODS: HANDLETAB1 +++++++++++++++++++++ */

/** Post a submission from a client with javascript disabled
(all front-end processign and sequential API calls moved to back end)
 *  @param    {Object}   body
 *  @returns  {Object}   redirect to page 2 or error message
 */

/** Handle Tab1 & Tab2 submissions from noscript form */
// for users with javascript disabled, all front-end processing
// moved to back end

// handleTab1 performs:
// lookupSFContactByFLE
// getAllEmployers
// createSFContact
// updateSFContact
// createSumbission
exports.handleTab1 = async (req, res, next) => {
  req.body.birthdate = this.formatSFDate(req.body.birthdate);
  if (!req.body.text_auth_opt_out) {
    req.body.text_auth_opt_out = false;
  } else if (req.body.text_auth_opt_out) {
    req.body.text_auth_opt_out = true;
  }
  delete req.body.checkoff_auth;
  const formValues = { ...req.body };
  // console.log(`sf.ctrl.js > handleTab1 972: formValues`);
  // console.log(formValues);
  req.locals = {
    next: true
  };

  // lookup contact by first/last/email
  const lookupRes = await this.lookupSFContactByFLE(req, res, next).catch(
    err => {
      console.error(`sf.ctrl.js > 981: ${err}`);
      return res.status(500).json({ message: err.message });
    }
  );

  let salesforce_id =
    lookupRes && lookupRes.salesforce_id ? lookupRes.salesforce_id : null;

  // if lookup was successful, update existing contact and move to next tab
  if (salesforce_id) {
    // console.log(`sf.ctrl.js > handleTab1 991 update contact`);
    req.params.id = salesforce_id;
    await this.updateSFContact(req, res, next)
      .then(salesforce_id => {
        req.body.salesforce_id = salesforce_id;
        // create initial submission here
        submissionCtrl
          .createSubmission(req, res, next)
          .then(submissionId => {
            // console.log(
            //   `sf.ctrl.js > handleTab1 1001: submissionId: ${submissionId}`
            // );
            const redirect = `${CLIENT_URL}/ns2.html?salesforce_id=${salesforce_id}&submission_id=${submissionId}`;
            // console.log(`sf.ctrl.js > handleTab1 1004: ${redirect}`);
            return res.redirect(redirect);
          })
          .catch(err => {
            console.error(`sf.ctrl.js > 1005: ${err}`);
            return res.status(500).json({ message: err.message });
          });
      })
      .catch(err => {
        console.error(`sf.ctrl.js > handleTab1 1013: ${err}`);
        return res.status(500).json({ message: err.message });
      });
  } else {
    // otherwise, lookupSFEmployers to get accountId, then
    // create new contact with submission data,
    // then move to next tab

    const sfEmployers = await this.getAllEmployers(req, res, next).catch(
      err => {
        console.error(`sf.ctrl.js > handleTab1 1023: ${err}`);
        return res.status(500).json({ message: err.message });
      }
    );

    // console.log(
    //   `sf.ctrl.js > handleTab1 1048: sfEmployers: ${sfEmployers.length}`
    // );
    // console.log(formValues.employer_name);
    const employers = Array.isArray(sfEmployers) ? sfEmployers : [{ Name: "" }];
    const empoyerName = formValues.employer_name
      ? formValues.employer_name
      : "";
    const employerObject = this.findEmployerObject(employers, empoyerName);
    // console.log(`sf.ctrl.js > handleTab1 1054: employerObject`);
    // console.log(employerObject);
    const employer_id = employerObject
      ? employerObject.Id
      : "0016100000WERGeAAP"; // <== 'Unknown Employer'
    const agency_number =
      employerObject && employerObject.Agency_Number__c
        ? employerObject.Agency_Number__c
        : employerObject &&
          employerObject.Parent &&
          employerObject.Parent.Agency_Number__c
        ? employerObject.Parent.Agency_Number__c
        : 0;
    // console.log(
    //   `sf.ctrl.js > handleTab1 1061: employer_id: ${employer_id}, agency_number: ${agency_number}`
    // );

    req.body.employer_id = employer_id;
    req.body.agency_number = agency_number;
    req.body.submission_date = this.formatSFDate(new Date());

    this.createSFContact(req, res, next)
      .then(salesforce_id => {
        // console.log(
        //   `sf.ctrl.js > handleTab1 1071: salesforce_id: ${salesforce_id}`
        // );

        req.body.salesforce_id = salesforce_id;

        // create initial submission here
        submissionCtrl
          .createSubmission(req, res, next)
          .then(submissionId => {
            // console.log(
            //   `sf.ctrl.js > handleTab1 1081: submissionId: ${submissionId}`
            // );
            const redirect = `${CLIENT_URL}/ns2.html?salesforce_id=${salesforce_id}&submission_id=${submissionId}`;
            // console.log(`sf.ctrl.js > handleTab1 1058: ${redirect}`);
            return res.redirect(redirect);
          })
          .catch(err => {
            console.error(`sf.ctrl.js > handleTab1 1088: ${err}`);
            return res.status(500).json({ message: err.message });
          });
      })
      .catch(err => {
        console.error(`sf.ctrl.js > handleTab1 1093: ${err}`);
        return res.status(500).json({ message: err.message });
      });
  }
};

// handleTab2 performs:
// updateSubmission
// createSFOMA

// for users with javascript disabled ONLY
exports.handleTab2 = async (req, res, next) => {
  // console.log(`sf.ctrl.js > 1123: handleTab2: req.body.legal_language`);
  // console.log(req.body.legal_language);
  // console.log(`sf.ctrl.js > 1123: handleTab2: legal_language`);
  // console.log(legal_language);
  req.body.online_campaign_source = "NoJavascript";
  req.body.legal_language = legal_language;
  if (req.body.terms_agree === "on") {
    req.body.terms_agree = true;
  }
  if (req.body.scholarship_flag === "on") {
    req.body.scholarship_flag = true;
  }
  // if (req.body.checkoff_auth === "on") {
  //   req.body.checkoff_auth = true;
  // }
  console.log(`sf.ctrl.js > 1115 handleTab2: formValues`);
  const formValues = { ...req.body };
  console.log(formValues);
  req.locals = {
    next: true
  };
  req.params = {
    id: req.body.submission_id
  };

  submissionCtrl
    .updateSubmission(req, res, next)
    .then(submissionBody => {
      if (submissionBody.req) {
        return res.json({
          message:
            submissionBody.statusMessage ||
            "There was an error processing the submission"
        });
      }
      req.body = { ...formValues, ...submissionBody };
      req.body.maintenance_of_effort = this.formatSFDate(new Date());
      req.body.seiu503_cba_app_date = this.formatSFDate(new Date());
      req.body.immediate_past_member_status = "Not a Member";
      console.log(`sf.ctrl.js > 1132 handleTab2: req.body`);
      delete req.body.checkoff_auth;
      console.log(req.body);
      this.createSFOnlineMemberApp(req, res, next)
        .then(sf_OMA_id => {
          // console.log(`sf.ctrl.js > 1137 handleTab2 sfOMA success`);
          return res.redirect("https://seiu503.org/members/thank-you/");
        })
        .catch(err => {
          console.error(`sf.ctrl.js > handleTab2 1141: ${err}`);
          return res.status(500).json({ message: err.message });
        });
    })
    .catch(err => {
      console.error(`sf.ctrl.js > handleTab2 1146: ${err}`);
      return res.status(500).json({ message: err.message });
    });
};
