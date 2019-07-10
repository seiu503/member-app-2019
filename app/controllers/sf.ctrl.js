const jsforce = require("jsforce");
const { generateSFContactFieldList } = require("../utils/fieldConfigs");

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
  const { id } = req.params;
  const query = `SELECT ${fieldList.join(
    ","
  )} FROM Contact WHERE Id = \'${id}\'`;
  console.log(query);
  conn.login(user, password, function(err, userInfo) {
    if (err) {
      console.log("sf.ctrl.js > 23");
      console.error(err);
      return res.status(500).json({ message: err.message });
    }
    // console.log(conn.accessToken);
    // console.log(conn.instanceUrl);
    // console.log("User ID: " + userInfo.id);
    // console.log("Org ID: " + userInfo.organizationId);

    try {
      conn.query(query, function(err, contact) {
        if (err) {
          console.log("sf.ctrl.js > 34");
          console.error(err);
          return res.status(500).json({ message: err.message });
        }
        console.log("successful sf api call, about to return response");
        console.log(contact.records[0]);
        res.status(200).json(contact.records[0]);
      });
    } catch (err) {
      console.log("sf.ctrl.js > 42");
      console.error(err);
      return res.status(500).json({ message: err.message });
    }
  });
};

/* ================================ EXPORT ================================= */

module.exports = {
  getSFContactById
};
