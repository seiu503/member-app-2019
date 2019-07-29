const jsforce = require("jsforce");
const {
  contactsTableFields,
  submissionsTableFields,
  generateSFContactFieldList,
  formatDate
} = require("../utils/fieldConfigs");

const conn = new jsforce.Connection({
  loginUrl: "https://test.salesforce.com" // setup for sandbox
});
const user = process.env.SALESFORCE_USER;
const password = process.env.SALESFORCE_PWD;
const fieldList = generateSFContactFieldList();

/** Fetch one contact from Salesforce by Salesforce Contact ID
 *  @param    {String}   id  	Salesforce Contact ID
 *  @returns  {Object}       	Salesforce Contact object OR error message.
 */
const getSFContactById = (req, res, next) => {
  console.log(`getSFContactById`);
  const { id } = req.params;
  const query = `SELECT ${fieldList.join(
    ","
  )} FROM Contact WHERE Id = \'${id}\'`;
  conn.login(user, password, function(err, userInfo) {
    if (err) {
      console.log("sf.ctrl.js > 28");
      console.error(err);
      return res.status(500).json({ message: err.message });
    }

    try {
      conn.query(query, function(err, contact) {
        if (err) {
          console.log("sf.ctrl.js > 36");
          console.error(err);
          return res.status(500).json({ message: err.message });
        }
        res.status(200).json(contact.records[0]);
      });
    } catch (err) {
      console.log("sf.ctrl.js > 43");
      console.error(err);
      return res.status(500).json({ message: err.message });
    }
  });
};

const createSFContact = (req, res, next) => {
  console.log("sf.ctrl.js > 51 createSFContact");
  const bodyRaw = { ...req.body };
  // console.log(bodyRaw);
  const body = {};
  // convert raw body object to key/value pairs using
  // SF API field names
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
  console.log("sf.ctrl.js > 66");
  // console.log(body);
  conn.login(user, password, function(err, userInfo) {
    if (err) {
      console.log("sf.ctrl.js > 70");
      console.error(err);
      return res.status(500).json({ message: err.message });
    }

    try {
      conn.sobject("Contact").create(
        {
          ...body
        },
        function(err, contact) {
          if (err || !contact.success) {
            let message = "Error creating contact";
            if (err.errorCode) {
              message = err.errorCode;
            }
            console.log("sf.ctrl.js > 87");
            console.error(err, contact);
            return res.status(500).json({ message });
          } else {
            console.log("sf.ctrl.js > 85");
            console.log(contact);
            // this should be undefined if calling as a standalone function
            console.log("sf.ctrl.js > 94 ########################");
            console.log(res.locals.next);
            if (res.locals.next) {
              console.log(
                "sf.ctrl.js > 96: next exists ###########################"
              );
              res.locals.sf_contact_id = contact.id || contact.Id;
              return next();
            }
            console.log("sf.ctrl.js > 100: next is undefined");
            return res
              .status(200)
              .json({ salesforce_id: contact.id || contact.Id });
          }
        }
      );
    } catch (err) {
      console.log("sf.ctrl.js > 93");
      console.error(err);
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
  console.log("sf.ctrl.js > 116 createOrUpdateSFContact");
  const { contact_id } = req.body;
  console.log(`sf.ctrl.js > 118: ${contact_id}`);

  // if contact id is sent in request body, then this is a prefill
  // skip the lookup function and head straight to updateSFContact
  if (contact_id) {
    console.log(`found contact id; skipping lookup`);
    // save contact_id to res.locals to pass to next middleware
    // (it was in the body already but updateSFContact
    // doesn't know to look for it there)
    res.locals.sf_contact_id = contact_id;
    res.locals.next = true;
    return updateSFContact(req, res, next);
  }

  // otherwise, proceed with lookup:
  console.log(
    "sf.ctrl.js > 132 (no prefill; looking up SF contact with fields below)"
  );
  const { first_name, last_name, home_email } = req.body;
  console.log(`sf.ctrl.js > 134: ${first_name}, ${last_name}, ${home_email}`);
  // fuzzy match on first name AND exact match on last name
  // AND exact match on either home OR work email
  // limit one most recently updated record

  const query = `SELECT Id, ${fieldList.join(
    ","
  )} FROM Contact WHERE FirstName LIKE \'${first_name}\' AND LastName = \'${last_name}\' AND (Home_Email__c = \'${home_email}\' OR Work_Email__c = \'${home_email}\') ORDER BY LastModifiedDate DESC LIMIT 1`;
  conn.login(user, password, function(err, userInfo) {
    if (err) {
      console.log("sf.ctrl.js > 144");
      console.error(err);
      return res.status(500).json({ message: err.message });
    }

    try {
      conn.query(query, function(err, contact) {
        if (err) {
          console.log("sf.ctrl.js > 152");
          console.error(err);
          return res.status(500).json({ message: err.message });
        }

        if (contact.totalSize === 0 || !contact) {
          console.log("sf.ctrl.js > 161: no matching SF contact found, ");
          // if no contact found,
          // create new contact and then pass contact id to next middleware
          // in res.locals
          res.locals.next = true;
          return createSFContact(req, res, next);
        }
        // if contact found, pass contact id to next middleware, which will
        // update it with the submission data from res.body
        if (contact) {
          console.log("sf.ctrl.js > 170");
          // console.log(contact);
          console.log(contact.records[0].Id);
          res.locals.sf_contact_id = contact.records[0].Id;
          res.locals.next = true;
          console.log(res.locals);
          return updateSFContact(req, res, next);
        }
        // this line should never be reached, if it is we are in trouble
        console.log("sf.ctrl.js > 175");
        console.log("something is rotten...");
      });
    } catch (err) {
      console.log("sf.ctrl.js > 179");
      console.error(err);
      return res.status(500).json({ message: err.message });
    }
  });
};

/** Get an array of all employers from Salesforce
 *  @param    {none}
 *  @returns  {Array||Object}    Array of SF Account objects OR error message.
 */
const getAllEmployers = (req, res, next) => {
  const query = `SELECT Id, Name, Sub_Division__c, Agency_Number__c FROM Account WHERE RecordTypeId = '01261000000ksTuAAI' and Division__c IN ('Retirees', 'Public', 'Care Provider')`;
  conn.login(user, password, function(err, userInfo) {
    if (err) {
      console.log("sf.ctrl.js > 194");
      console.error(err);
      return res.status(500).json({ message: err.message });
    }

    try {
      conn.query(query, function(err, accounts) {
        if (err) {
          console.log("sf.ctrl.js > 202");
          console.error(err);
          return res.status(500).json({ message: err.message });
        }
        res.status(200).json(accounts.records);
      });
    } catch (err) {
      console.log("sf.ctrl.js > 209");
      console.error(err);
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
  console.log("sf.ctrl.js > 227: updateSFContact");
  const { sf_contact_id } = res.locals;
  console.log(sf_contact_id);
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
  conn.login(user, password, function(err, userInfo) {
    if (err) {
      console.log("sf.ctrl.js > 246");
      console.error(err);
      return res.status(500).json({ message: err.message });
    }

    try {
      conn.sobject("Contact").update(
        {
          Id: sf_contact_id,
          ...updates
        },
        function(err, contact) {
          if (err || !contact.success) {
            console.log("sf.ctrl.js > 265");
            console.error(err, contact);
            let message = "Error updating contact";
            if (err.errorCode) {
              message = err.errorCode;
            }
            return res.status(500).json({ message });
          } else {
            console.log("sf.ctrl.js > 262");
            console.log(contact);
            return next();
          }
        }
      );
    } catch (err) {
      console.log("sf.ctrl.js > 267");
      console.error(err);
      return res.status(500).json({ message: err.message });
    }
  });
};

/** Create an OnlineMemberApps object in Salesforce with submission data
 *  @param    {Object}   body         Submission object
 *  @returns  does not return to client; passes salesforce_id to next function
 */

const createSFOnlineMemberApp = (req, res, next) => {
  console.log("sf.ctrl.js > 283: createSFOnlineMemberApp");
  conn.login(user, password, function(err, userInfo) {
    if (err) {
      console.log("sf.ctrl.js > 276");
      console.error(err);
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
      console.log("sf.ctrl.js > 307");
      conn.sobject("OnlineMemberApp__c").create(
        {
          ...data
        },
        function(err, OMA) {
          if (err || !OMA.success) {
            console.log("sf.ctrl.js > 324");
            console.error(err, OMA);
            let message = "Error creating online member application";
            if (err.errorCode) {
              message = err.errorCode;
            }
            return res.status(500).json({ message });
          } else {
            return res.status(200).json({
              salesforce_id: res.locals.sf_contact_id,
              submission_id: res.locals.submission_id
            });
          }
        }
      );
    } catch (err) {
      console.log("sf.ctrl.js > 308");
      console.error(err);
      return res.status(500).json({ message: err.message });
    }
  });
};

/* ================================ EXPORT ================================= */

module.exports = {
  getSFContactById,
  createSFContact,
  createOrUpdateSFContact,
  getAllEmployers,
  createSFOnlineMemberApp,
  updateSFContact
};
