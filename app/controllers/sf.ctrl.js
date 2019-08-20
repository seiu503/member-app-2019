const jsforce = require("jsforce");
const {
  contactsTableFields,
  submissionsTableFields,
  generateSFContactFieldList,
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

/** Fetch one contact from Salesforce by Salesforce Contact ID
 *  @param    {String}   id  	Salesforce Contact ID
 *  @returns  {Object}       	Salesforce Contact object OR error message.
 */
const getSFContactById = async (req, res, next) => {
  // console.log(`sf.ctrl.js > getSFContactById`);
  const { id } = req.params;
  const query = `SELECT ${fieldList.join(
    ","
  )}, Id FROM Contact WHERE Id = \'${id}\'`;
  let conn = new jsforce.Connection({ loginUrl });
  let userInfo;
  try {
    userInfo = await conn.login(user, password);
  } catch (err) {
    // console.error(`sf.ctrl.js > 36: ${err}`);
    return res.status(500).json({ message: err.message });
  }
  let contact;
  try {
    contact = await conn.query(query);
    res.status(200).json(contact.records[0]);
  } catch (err) {
    // console.error(`sf.ctrl.js > 44: ${err}`);
    return res.status(500).json({ message: err.message });
  }
};

/** Delete one contact from Salesforce by Salesforce Contact ID
 *  @param    {String}   id   Salesforce Contact ID
 *  @returns  {Object}        Success or error message.
 */
const deleteSFContactById = (req, res, next) => {
  const { id } = req.params;
  conn.login(user, password, function(err, userInfo) {
    if (err) {
      // console.error(`sf.ctrl.js > 54: ${err}`);
      return res.status(500).json({ message: err.message });
    }

    try {
      conn.sobject("Contact").destroy(id, function(err, ret) {
        if (err || !ret.success) {
          // console.error(`sf.ctrl.js > 61: ${err}`);
          return res.status(500).json({ message: err.message });
        }
        res.status(200).json({ message: "Successfully deleted contact" });
      });
    } catch (err) {
      // console.error(`sf.ctrl.js > 67: ${err}`);
      return res.status(500).json({ message: err.message });
    }
  });
};

const createSFContact = (req, res, next) => {
  console.log(`sf.ctrl.js > 75: createSFContact`);
  const bodyRaw = { ...req.body };
  const body = {};

  // convert raw body to key/value pairs using SF API field names
  Object.keys(bodyRaw).forEach(key => {
    if (contactsTableFields[key]) {
      const sfFieldName = contactsTableFields[key].SFAPIName;
      body[sfFieldName] = bodyRaw[key];
    }
  });
  delete body["Account.Id"];
  delete body["Account.Agency_Number__c"];
  delete body["Account.WS_Subdivision_from_Agency__c"];
  body.AccountId = bodyRaw.employer_id;

  conn.login(user, password, function(err, userInfo) {
    if (err) {
      console.error(`sf.ctrl.js > 91: ${err}`);
      return res.status(500).json({ message: err.message });
    }

    try {
      conn.sobject("Contact").create({ ...body }, function(err, contact) {
        if (err || !contact.success) {
          let message = "Error creating contact";
          if (err.errorCode) {
            message = err.errorCode;
          }
          console.error(`sf.ctrl.js > 104: ${err}`);
          return res.status(500).json({ message });
        } else {
          // res.locals.next will be undefined if calling as a
          // standalone function; in that case return data to client
          if (res.locals.next) {
            console.log(`sf.ctrl.js > 109: returning next`);
            res.locals.sf_contact_id = contact.id || contact.Id;
            return next();
          }
          console.log(`sf.ctrl.js > 113: returning to client`);
          return res
            .status(200)
            .json({ salesforce_id: contact.id || contact.Id });
        }
      });
    } catch (err) {
      console.error(`sf.ctrl.js > 120: ${err}`);
      return res.status(500).json({ message: err.message });
    }
  });
};

/** Lookup contact in Salesforce by Firstname, Lastname, & Email.
 *  @param    {Object}   body         first_name, last_name, home_email
 *  @returns  {Object}                sf_contact_id if successful, or returns
 *                                    object with error message to client.
 */

const lookupSFContactByFLE = (req, res, next) => {
  console.log("lookupSFContactByFLE");
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
  conn.login(user, password, function(err, userInfo) {
    if (err) {
      console.error(`sf.ctrl.js > 143: ${err}`);
      return res.status(500).json({ message: err.message });
    }

    try {
      conn.query(query, function(err, contact) {
        if (err) {
          console.error(`sf.ctrl.js > 148: ${err}`);
          return res.status(500).json({ message: err.message });
        }

        if (contact.totalSize === 0 || !contact) {
          // if no contact found, return error message to client
          return res.status(200).json({
            message:
              "Sorry, we could not find a record matching that name and email. Please contact your organizer at 1-844-503-SEIU (7348) for help."
          });
        }
        // if contact found, return contact id to client
        if (contact) {
          return res.status(200).json({ salesforce_id: contact.records[0].Id });
        }
      });
    } catch (err) {
      console.error(`sf.ctrl.js > 194: ${err}`);
      return res.status(500).json({ message: err.message });
    }
  });
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
const createOrUpdateSFContact = (req, res, next) => {
  console.log(`sf.ctrl.js > 197 > createOrUpdateSFContact`);
  const { salesforce_id } = req.body;

  // if contact id is sent in request body, then this is a prefill
  // skip the lookup function and head straight to updateSFContact
  if (salesforce_id) {
    // save contact_id to res.locals to pass to next middleware
    // (it was in the body already but updateSFContact
    // doesn't know to look for it there)
    res.locals.sf_contact_id = salesforce_id;
    res.locals.next = true;
    console.log(`sf.ctrljs > 208 > found contact id (salesforce_id)`);
    return updateSFContact(req, res, next);
  }

  // otherwise, proceed with lookup:
  const { first_name, last_name, home_email } = req.body;
  // fuzzy match on first name AND exact match on last name
  // AND exact match on either home OR work email
  // limit one most recently updated record

  const query = `SELECT Id, ${fieldList.join(
    ","
  )} FROM Contact WHERE FirstName LIKE \'${first_name}\' AND LastName = \'${last_name}\' AND (Home_Email__c = \'${home_email}\' OR Work_Email__c = \'${home_email}\') ORDER BY LastModifiedDate DESC LIMIT 1`;
  console.log(`sf.ctrl.js > 225`);
  conn.login(user, password, function(err, userInfo) {
    if (err) {
      console.error(`sf.ctrl.js > 168: ${err}`);
      return res.status(500).json({ message: err.message });
    }
    console.log(`sf.ctrl.js > 231`);
    try {
      console.log(`sf.ctrl.js > 233`);
      conn.query(query, function(err, contact) {
        if (err) {
          console.error(`sf.ctrl.js > 175: ${err}`);
          return res.status(500).json({ message: err.message });
        }

        if (contact.totalSize === 0 || !contact) {
          // if no contact found, create new contact, then pass id to
          // next middleware in res.locals
          res.locals.next = true;
          console.log(`sf.ctrl.js > 227: creating new contact`);
          return createSFContact(req, res, next);
        }
        // if contact found, pass contact id to next middleware, which will
        // update it with the submission data from res.body
        if (contact) {
          console.log(`sf.ctrl.js > 250: found matching contact`);
          res.locals.sf_contact_id = contact.records[0].Id;
          console.log(res.locals.sf_contact_id);
          res.locals.next = true;
          return updateSFContact(req, res, next);
        }
      });
    } catch (err) {
      console.error(`sf.ctrl.js > 194: ${err}`);
      return res.status(500).json({ message: err.message });
    }
  });
};

/** Get an array of all employers from Salesforce
 *  @param    {none}
 *  @returns  {Array||Object}    Array of SF Account objects OR error message.
 */
const getAllEmployers = (req, res, next) => {
  console.log("getAllEmployers");
  const query = `SELECT Id, Name, Sub_Division__c, Agency_Number__c FROM Account WHERE RecordTypeId = '01261000000ksTuAAI' and Division__c IN ('Retirees', 'Public', 'Care Provider')`;
  conn.login(user, password, function(err, userInfo) {
    if (err) {
      console.error(`sf.ctrl.js > 208: ${err}`);
      return res.status(500).json({ message: err.message });
    }

    try {
      conn.query(query, function(err, accounts) {
        if (err) {
          console.error(`sf.ctrl.js > 215: ${err}`);
          return res.status(500).json({ message: err.message });
        }
        console.log(`sf.ctrl.js > 278: returning employers to client`);
        res.status(200).json(accounts.records);
      });
    } catch (err) {
      console.error(`sf.ctrl.js > 221: ${err}`);
      return res.status(500).json({ message: err.message });
    }
  });
};

/** Update a contact in Salesforce by Salesforce Contact ID
 *  @param    {String}   id           Salesforce Contact ID
 *  @param    {Object}   body         Raw submission data used to generate
 *                                    updates object, containing
 *                                    key/value pairs of fields to be updated.
 *  @returns  {Object}        Salesforce Contact id OR error message.
 */
const updateSFContact = (req, res, next) => {
  console.log(`sf.ctrl.js > 284: updateSFContact`);
  const { sf_contact_id } = res.locals;
  const updatesRaw = { ...req.body };
  const updates = {};
  // convert updates object to key/value pairs using
  // SF API field names
  console.log(`sf.ctrl.js > 307`);
  Object.keys(updatesRaw).forEach(key => {
    if (contactsTableFields[key]) {
      const sfFieldName = contactsTableFields[key].SFAPIName;
      updates[sfFieldName] = updatesRaw[key];
    }
  });
  console.log(`sf.ctrl.js > 314`);
  delete updates["Account.Id"];
  delete updates["Account.Agency_Number__c"];
  delete updates["Account.WS_Subdivision_from_Agency__c"];
  updates.AccountId = updatesRaw.employer_id;

  let conn = new jsforce.Connection({ loginUrl });
  console.log(`sf.ctrl.js > 321`);
  conn.login(user, password, function(err, userInfo) {
    console.log(`sf.ctrl.js > 323: err`);
    console.log(err);
    console.log(`sf.ctrl.js > 325: userInfo`);
    console.log(userInfo);
    if (err) {
      console.error(`sf.ctrl.js > 328: ${err}`);
      return res.status(500).json({ message: err.message });
    }
    console.log(`sf.ctrl.js > 331`);
    try {
      conn.sobject("Contact").update(
        {
          Id: sf_contact_id,
          ...updates
        },
        function(err, contact) {
          console.log(`sf.ctrl.js > 339: contact`);
          console.log(contact);
          if (err || !contact.success) {
            console.error(`sf.ctrl.js > 342: ${err}`);
            let message = "Error updating contact";
            if (err.errorCode) {
              message = err.errorCode;
            }
            return res.status(500).json({ message });
          } else {
            if (res.locals.next) {
              console.log(`sf.ctrl.js > 350: returning next`);
              return next();
            }
            console.log(`sf.ctrl.js > 353: returning to client`);
            return res.status(200).json({
              salesforce_id: res.locals.sf_contact_id,
              submission_id: res.locals.submission_id
            });
          }
        }
      );
    } catch (err) {
      console.error(`sf.ctrl.js > 277: ${err}`);
      return res.status(500).json({ message: err.message });
    }
  });
};

/** Create an OnlineMemberApps object in Salesforce with submission data
 *  @param    {Object}   body         Submission object
 *  @returns  does not return to client; passes salesforce_id to next function
 */

const createSFOnlineMemberApp = (req, res, next) => {
  conn.login(user, password, function(err, userInfo) {
    if (err) {
      console.error(`sf.ctrl.js > 291: ${err}`);
      return res.status(500).json({ message: err.message });
    }

    try {
      const dataRaw = { ...req.body };
      const data = {};
      // convert data object to key/value pairs using
      // SF API field names
      Object.keys(dataRaw).forEach(key => {
        if (submissionsTableFields[key]) {
          const sfFieldName = submissionsTableFields[key].SFAPIName;
          data[sfFieldName] = dataRaw[key];
        }
      });
      data.Worker__c = res.locals.sf_contact_id;
      data.Birthdate__c = formatDate(dataRaw.birthdate);
      delete data["Account.Id"];
      delete data["Account.Agency_Number__c"];
      delete data["Account.WS_Subdivision_from_Agency__c"];

      conn.sobject("OnlineMemberApp__c").create(
        {
          ...data
        },
        function(err, OMA) {
          if (err || !OMA.success) {
            console.error(`sf.ctrl.js > 318: ${err}`);
            let message = "Error creating online member application";
            if (err.errorCode) {
              message = err.errorCode;
            }
            return res.status(500).json({ message });
          } else {
            return res.status(200).json({
              salesforce_id: res.locals.sf_contact_id,
              submission_id: res.locals.submission_id,
              sf_OMA_id: OMA.id
            });
          }
        }
      );
    } catch (err) {
      console.error(`sf.ctrl.js > 334: ${err}`);
      return res.status(500).json({ message: err.message });
    }
  });
};

/** Delete OnlineMemberApp by Id
 *  @param    {String}   Id         OMA Id
 *  @returns  {Object}   Success or error message
 */

const deleteSFOnlineMemberApp = (req, res, next) => {
  conn.login(user, password, function(err, userInfo) {
    if (err) {
      // console.error(`sf.ctrl.js > 348: ${err}`);
      return res.status(500).json({ message: err.message });
    }

    try {
      const { id } = req.params;
      conn.sobject("OnlineMemberApp__c").destroy(id, function(err, ret) {
        if (err || !ret.success) {
          // console.error(`sf.ctrl.js > 357: ${err}`);
          let message = "Error deleting online member application";
          if (err.errorCode) {
            message = err.errorCode;
          }
          return res.status(500).json({ message });
        } else {
          return res
            .status(200)
            .json({ message: "Successfully deleted Online Member App" });
        }
      });
    } catch (err) {
      // console.error(`sf.ctrl.js > 369: ${err}`);
      return res.status(500).json({ message: err.message });
    }
  });
};

/* ================================ EXPORT ================================= */

module.exports = {
  getSFContactById,
  lookupSFContactByFLE,
  deleteSFContactById,
  createSFContact,
  createOrUpdateSFContact,
  getAllEmployers,
  createSFOnlineMemberApp,
  deleteSFOnlineMemberApp,
  updateSFContact
};
