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
  conn.login(user, password, function(err, userInfo) {
    if (err) {
      return console.error(err);
    }
    console.log(conn.accessToken);
    console.log(conn.instanceUrl);
    // logged in user property
    console.log("User ID: " + userInfo.id);
    console.log("Org ID: " + userInfo.organizationId);

    try {
      conn.query(query, function(err, contact) {
        if (err) {
          return console.error(err);
        }
        console.log("total : " + contact.totalSize);
        console.log("fetched : " + contact.records.length);
        console.log(contact);
        res.status(200).json(contact.records[0]);
      });
    } catch (err) {
      return console.error(err);
    }
  });
};

/* ================================ EXPORT ================================= */

module.exports = {
  getSFContactById
};
