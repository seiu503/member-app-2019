const { mockReq, mockRes } = require("sinon-express-mock");
const sinon = require("sinon");
const { assert } = sinon;
const { suite, test } = require("mocha");
const axios = require("axios");
const knexCleaner = require("knex-cleaner");
const nock = require("nock");
const chaiHttp = require("chai-http");
const chai = require("chai");
const expect = chai.expect;
chai.use(chaiHttp);

const sfCtrl = require("../app/controllers/sf.ctrl.js");
const jsforce = require("jsforce");
const { upload } = require("../app/controllers/image.ctrl");
const {
  generateSFContactFieldList,
  generateSampleSubmission,
  generateSFDJRFieldList,
  paymentFields,
  generateCAPEValidateBackEnd
} = require("../app/utils/fieldConfigs");
const fieldList = generateSFContactFieldList();
const paymentFieldList = generateSFDJRFieldList();

let submissionBody = generateSampleSubmission();
let capeBody = generateCAPEValidateBackEnd();
const { db, TABLES } = require("../app/config/knex");

const djrBody = {
  Worker__c: "0035500000VFkjOAAT",
  Unioni_se_MemberID__c: "XJZT1WYV",
  Payment_Method__c: "Unionise",
  AFH_Number_of_Residents__c: 1
};

let loginError,
  queryError,
  sobjectError,
  unioniseError,
  responseStub,
  query,
  jsforceSObjectCreateStub,
  jsforceSObjectUpdateStub,
  queryStub,
  loginStub,
  server,
  next,
  token,
  status,
  scope,
  memberShortId = "XJZT1WYV",
  res = mockRes(),
  req = mockReq(),
  first_name = "firstname",
  last_name = "lastname",
  home_email = "fake@email.com";
contactStub = { id: "0035500000VFkjOAAT", success: true, errors: [] };

suite("sf.ctrl.js", function() {
  after(() => {
    return knexCleaner.clean(db);
  });
  afterEach(function() {
    res = mockRes();
    sinon.restore();
  });
  suite("sfCtrl > getSFContactById", function() {
    beforeEach(function() {
      return new Promise(resolve => {
        req = mockReq({
          params: {
            id: "123456789"
          }
        });
        responseStub = { records: [contactStub] };
        queryStub = sinon.stub().returns((null, responseStub));
        loginStub = sinon.stub();
        jsforceStub = {
          login: loginStub,
          query: queryStub
        };
        jsforceConnectionStub = sinon
          .stub(jsforce, "Connection")
          .returns(jsforceStub);
        resolve();
      });
    });

    afterEach(() => {
      sinon.restore();
    });

    test("gets a single contact by Id", async function() {
      query = `SELECT ${fieldList.join(
        ","
      )}, Id FROM Contact WHERE Id = \'123456789\'`;
      try {
        await sfCtrl.getSFContactById(req, res);
        assert.called(jsforceConnectionStub);
        assert.called(jsforceStub.login);
        assert.calledWith(jsforceStub.query, query);
        assert.calledWith(res.json, contactStub);
      } catch (err) {
        console.log(err);
      }
    });

    test("returns error if login fails", async function() {
      loginError =
        "Error: INVALID_LOGIN: Invalid username, password, security token; or user locked out.";
      loginStub = sinon.stub().throws(new Error(loginError));
      jsforceStub.login = loginStub;

      try {
        await sfCtrl.getSFContactById(req, res);
        assert.called(jsforceConnectionStub);
        assert.called(jsforceStub.login);
        assert.calledWith(res.status, 500);
        assert.calledWith(res.json, { message: loginError });
      } catch (err) {
        console.log(err);
      }
    });

    test("returns error if query fails", async function() {
      queryError = "Error: MALFORMED_QUERY: unexpected token: query";
      queryStub = sinon.stub().throws(new Error(queryError));
      jsforceStub.query = queryStub;

      try {
        await sfCtrl.getSFContactById(req, res);
        assert.called(jsforceConnectionStub);
        assert.called(jsforceStub.query);
        assert.calledWith(res.status, 500);
        assert.calledWith(res.json, { message: queryError });
      } catch (err) {
        console.log(err);
      }
    });
  });

  suite("sfCtrl > deleteSFContactById", function() {
    beforeEach(function() {
      return new Promise(resolve => {
        req = mockReq({
          params: {
            id: "123456789"
          }
        });
        responseStub = { message: "Successfully deleted contact" };
        jsforceSObjectDestroyStub = sinon.stub();
        loginStub = sinon.stub();
        jsforceStub = {
          login: loginStub,
          sobject: sinon.stub().returns({
            destroy: jsforceSObjectDestroyStub
          })
        };
        resolve();
      });
    });

    afterEach(() => {
      sinon.restore();
    });

    test("deletes a single contact by Id", async function() {
      responseStub = { message: "Successfully deleted contact" };
      jsforceSObjectDestroyStub = sinon.stub();
      loginStub = sinon.stub();
      jsforceStub = {
        login: loginStub,
        sobject: sinon.stub().returns({
          destroy: jsforceSObjectDestroyStub
        })
      };
      jsforceConnectionStub = sinon
        .stub(jsforce, "Connection")
        .returns(jsforceStub);

      try {
        await sfCtrl.deleteSFContactById(req, res);
        assert.called(jsforceConnectionStub);
        assert.called(jsforceStub.login);
        assert.calledWith(res.json, responseStub);
      } catch (err) {
        console.log(err);
      }
    });

    test("returns error if login fails", async function() {
      loginError =
        "Error: INVALID_LOGIN: Invalid username, password, security token; or user locked out.";
      loginStub = sinon.stub().throws(new Error(loginError));
      jsforceStub.login = loginStub;
      jsforceConnectionStub = sinon
        .stub(jsforce, "Connection")
        .returns(jsforceStub);

      try {
        await sfCtrl.deleteSFContactById(req, res);
        assert.called(jsforceConnectionStub);
        assert.called(jsforceStub.login);
        assert.calledWith(res.status, 500);
        assert.calledWith(res.json, { message: loginError });
      } catch (err) {
        console.log(err);
      }
    });

    test("returns error if sobject destroy fails", async function() {
      sobjectError =
        "NOT_FOUND: Provided external ID field does not exist or is not accessible: 123456789";
      jsforceSObjectDestroyStub = sinon.stub().throws(new Error(sobjectError));
      jsforceStub = {
        login: loginStub,
        sobject: sinon.stub().returns({ destroy: jsforceSObjectDestroyStub })
      };
      jsforceConnectionStub = sinon
        .stub(jsforce, "Connection")
        .returns(jsforceStub);

      try {
        await sfCtrl.deleteSFContactById(req, res);
        assert.called(jsforceConnectionStub);
        assert.called(jsforceStub.login);
        assert.calledWith(jsforceStub.sobject, "Contact");
        assert.calledWith(res.status, 500);
        assert.calledWith(res.json, { message: sobjectError });
      } catch (err) {
        console.log(err);
      }
    });
  });

  suite("sfCtrl > createSFContact", function() {
    beforeEach(function() {
      return new Promise(resolve => {
        req = mockReq({
          body: submissionBody
        });
        jsforceSObjectCreateStub = sinon.stub().returns((null, contactStub));
        loginStub = sinon.stub();
        jsforceStub = {
          login: loginStub,
          sobject: sinon.stub().returns({
            create: jsforceSObjectCreateStub
          })
        };
        resolve();
      });
    });

    afterEach(() => {
      sinon.restore();
    });

    test("creates a single SF contact", async function() {
      responseStub = { salesforce_id: "0035500000VFkjOAAT" };
      jsforceConnectionStub = sinon
        .stub(jsforce, "Connection")
        .returns(jsforceStub);

      try {
        await sfCtrl.createSFContact(req, res);
        assert.called(jsforceConnectionStub);
        assert.called(jsforceStub.login);
        assert.calledWith(res.json, responseStub);
      } catch (err) {
        console.log(err);
      }
    });

    test("returns next if res.locals.next is set", async function() {
      next = sinon.stub();
      jsforceConnectionStub = sinon
        .stub(jsforce, "Connection")
        .returns(jsforceStub);
      res.locals.next = next;

      try {
        const result = await sfCtrl.createSFContact(req, res, next);
        assert.called(jsforceConnectionStub);
        assert.called(jsforceStub.login);
        assert.match(result, next());
      } catch (err) {
        console.log(err);
      }
    });

    test("returns error if login fails", async function() {
      loginError =
        "Error: INVALID_LOGIN: Invalid username, password, security token; or user locked out.";
      loginStub = sinon.stub().throws(new Error(loginError));
      jsforceStub.login = loginStub;
      jsforceConnectionStub = sinon
        .stub(jsforce, "Connection")
        .returns(jsforceStub);

      const res = mockRes();
      const req = mockReq({
        body: submissionBody
      });
      try {
        await sfCtrl.createSFContact(req, res);
        assert.called(jsforceConnectionStub);
        assert.called(jsforceStub.login);
        assert.calledWith(res.status, 500);
        assert.calledWith(res.json, { message: loginError });
      } catch (err) {
        console.log(err);
      }
    });

    test("returns error if sobject create fails", async function() {
      sobjectError =
        "NOT_FOUND: Provided external ID field does not exist or is not accessible: 123456789";
      jsforceSObjectCreateStub = sinon.stub().throws(new Error(sobjectError));
      jsforceStub = {
        login: loginStub,
        sobject: sinon.stub().returns({ create: jsforceSObjectCreateStub })
      };
      jsforceConnectionStub = sinon
        .stub(jsforce, "Connection")
        .returns(jsforceStub);

      const res = mockRes();
      const req = mockReq({
        body: submissionBody
      });
      try {
        await sfCtrl.createSFContact(req, res);
        assert.called(jsforceConnectionStub);
        assert.called(jsforceStub.login);
        assert.calledWith(jsforceStub.sobject, "Contact");
        assert.calledWith(res.status, 500);
        assert.calledWith(res.json, { message: sobjectError });
      } catch (err) {
        console.log(err);
      }
    });
  });

  suite("sfCtrl > lookupSFContactByFLE", function() {
    beforeEach(function() {
      return new Promise(resolve => {
        query = `SELECT Id, ${fieldList.join(
          ","
        )} FROM Contact WHERE FirstName LIKE \'${first_name}\' AND LastName = \'${last_name}\' AND (Home_Email__c = \'${home_email}\' OR Work_Email__c = \'${home_email}\') ORDER BY LastModifiedDate DESC LIMIT 1`;
        req = mockReq({
          body: {
            first_name,
            last_name,
            home_email
          }
        });
        responseStub = { records: [contactStub] };
        queryStub = sinon.stub().returns((null, responseStub));
        loginStub = sinon.stub();
        jsforceStub = {
          login: loginStub,
          query: queryStub
        };
        jsforceConnectionStub = sinon
          .stub(jsforce, "Connection")
          .returns(jsforceStub);
        resolve();
      });
    });

    afterEach(() => {
      sinon.restore();
    });

    test("finds a single contact by first, last, email", async function() {
      responseStub = {
        salesforce_id: "0035500000VFkjOAAT",
        Current_CAPE__c: undefined
      };
      try {
        await sfCtrl.lookupSFContactByFLE(req, res);
        assert.called(jsforceConnectionStub);
        assert.called(jsforceStub.login);
        assert.calledWith(res.status, 200);
        assert.calledWith(jsforceStub.query, query);
        assert.calledWith(res.json, responseStub);
      } catch (err) {
        console.log(err);
      }
    });

    test("returns a message if matching contact not found", async function() {
      let message =
        "Sorry, we could not find a record matching that name and email. Please contact your organizer at 1-844-503-SEIU (7348) for help.";
      queryStub = sinon.stub().returns({ totalSize: 0 });
      jsforceStub.query = queryStub;
      try {
        await sfCtrl.lookupSFContactByFLE(req, res);
        assert.called(jsforceConnectionStub);
        assert.called(jsforceStub.login);
        assert.calledWith(res.status, 200);
        assert.calledWith(jsforceStub.query, query);
        assert.calledWith(res.json, { message });
      } catch (err) {
        console.log(err);
      }
    });

    test("returns error if login fails", async function() {
      loginError =
        "Error: INVALID_LOGIN: Invalid username, password, security token; or user locked out.";
      loginStub = sinon.stub().throws(new Error(loginError));
      jsforceStub.login = loginStub;

      try {
        await sfCtrl.lookupSFContactByFLE(req, res);
        assert.called(jsforceConnectionStub);
        assert.called(jsforceStub.login);
        assert.calledWith(res.status, 500);
        assert.calledWith(res.json, { message: loginError });
      } catch (err) {
        console.log(err);
      }
    });

    test("returns error if query fails", async function() {
      queryError = "Error: MALFORMED_QUERY: unexpected token: query";
      queryStub = sinon.stub().throws(new Error(queryError));
      jsforceStub.query = queryStub;

      try {
        await sfCtrl.lookupSFContactByFLE(req, res);
        assert.called(jsforceConnectionStub);
        assert.called(jsforceStub.query);
        assert.calledWith(res.status, 500);
        assert.calledWith(res.json, { message: queryError });
      } catch (err) {
        console.log(err);
      }
    });
  });

  suite("sfCtrl > createOrUpdateSFContact", function() {
    beforeEach(function() {
      return new Promise(resolve => {
        const first_name = "firstname",
          last_name = "lastname",
          home_email = "fake@email.com";
        query = `SELECT Id, ${fieldList.join(
          ","
        )} FROM Contact WHERE FirstName LIKE \'${first_name}\' AND LastName = \'${last_name}\' AND (Home_Email__c = \'${home_email}\' OR Work_Email__c = \'${home_email}\') ORDER BY LastModifiedDate DESC LIMIT 1`;
        req = mockReq({
          body: {
            salesforce_id: "123456789"
          }
        });
        responseStub = { records: [contactStub] };
        queryStub = sinon.stub().returns((null, responseStub));
        loginStub = sinon.stub();
        jsforceStub = {
          login: loginStub,
          query: queryStub
        };
        jsforceConnectionStub = sinon
          .stub(jsforce, "Connection")
          .returns(jsforceStub);
        resolve();
      });
    });

    afterEach(() => {
      sinon.restore();
    });

    test("if id in req body, calls updateSFContact", async function() {
      let updateSFContactStub = sinon.stub(sfCtrl, "updateSFContact");
      try {
        await sfCtrl.createOrUpdateSFContact(req, res);
        assert.called(updateSFContactStub);
        updateSFContactStub.restore();
      } catch (err) {
        console.log(err);
      }
    });

    test("if no id in req params and no matching contact found, calls createSFContact", async function() {
      contactStub = { totalSize: 0 };
      let createSFContactStub = sinon.stub(sfCtrl, "createSFContact");
      query = `SELECT Id, ${fieldList.join(
        ","
      )} FROM Contact WHERE FirstName LIKE \'${first_name}\' AND LastName = \'${last_name}\' AND (Home_Email__c = \'${home_email}\' OR Work_Email__c = \'${home_email}\') ORDER BY LastModifiedDate DESC LIMIT 1`;
      req = mockReq({
        params: {},
        body: {
          first_name,
          last_name,
          home_email
        }
      });
      queryStub = sinon.stub().returns(contactStub);
      jsforceStub.query = queryStub;
      try {
        let result = await sfCtrl.createOrUpdateSFContact(req, res, next);
        assert.called(jsforceConnectionStub);
        assert.called(jsforceStub.login);
        assert.calledWith(jsforceStub.query, query);
        assert.called(createSFContactStub);
        createSFContactStub.restore();
      } catch (err) {
        console.log(err);
      }
    });

    test("if no id in req params and matching contact found, calls updateSFContact", async function() {
      let updateSFContactStub = sinon.stub(sfCtrl, "updateSFContact");
      query = `SELECT Id, ${fieldList.join(
        ","
      )} FROM Contact WHERE FirstName LIKE \'${first_name}\' AND LastName = \'${last_name}\' AND (Home_Email__c = \'${home_email}\' OR Work_Email__c = \'${home_email}\') ORDER BY LastModifiedDate DESC LIMIT 1`;
      req = mockReq({
        params: {},
        body: {
          first_name,
          last_name,
          home_email
        }
      });
      queryStub = sinon.stub().returns({ records: [contactStub] });
      jsforceStub.query = queryStub;
      try {
        let result = await sfCtrl.createOrUpdateSFContact(req, res, next);
        assert.called(jsforceConnectionStub);
        assert.called(jsforceStub.login);
        assert.calledWith(jsforceStub.query, query);
        assert.called(updateSFContactStub);
        updateSFContactStub.restore();
      } catch (err) {
        console.log(err);
      }
    });

    test("returns error if login fails", async function() {
      loginError =
        "Error: INVALID_LOGIN: Invalid username, password, security token; or user locked out.";
      loginStub = sinon.stub().throws(new Error(loginError));
      jsforceStub.login = loginStub;

      try {
        await sfCtrl.createOrUpdateSFContact(req, res);
        assert.called(jsforceConnectionStub);
        assert.called(jsforceStub.login);
        assert.calledWith(res.status, 500);
        assert.calledWith(res.json, { message: loginError });
      } catch (err) {
        // console.log(err);
      }
    });

    test("returns error if query fails", async function() {
      queryError = "Error: MALFORMED_QUERY: unexpected token: query";
      queryStub = sinon.stub().throws(new Error(queryError));
      jsforceStub.query = queryStub;
      req = mockReq({
        params: {},
        body: {
          first_name,
          last_name,
          home_email
        }
      });

      try {
        await sfCtrl.createOrUpdateSFContact(req, res);
        assert.called(jsforceConnectionStub);
        assert.called(jsforceStub.query);
        assert.calledWith(res.status, 500);
        assert.calledWith(res.json, { message: queryError });
      } catch (err) {
        console.log(err);
      }
    });
  });

  suite("sfCtrl > updateSFContact", function() {
    beforeEach(function() {
      return new Promise(resolve => {
        req = mockReq({
          body: submissionBody
        });
        jsforceSObjectUpdateStub = sinon.stub().returns((null, contactStub));
        loginStub = sinon.stub();
        jsforceStub = {
          login: loginStub,
          sobject: sinon.stub().returns({
            update: jsforceSObjectUpdateStub
          })
        };
        resolve();
      });
    });

    afterEach(() => {
      sinon.restore();
    });

    test("updates a SF contact", async function() {
      responseStub = {
        salesforce_id: "sfid0035500000VFkjOAAT",
        submission_id: "submid0035500000VFkjOAAT"
      };
      req.params = {
        id: "sfid0035500000VFkjOAAT"
      };
      res.locals = {
        sf_contact_id: "sfid0035500000VFkjOAAT",
        submission_id: "submid0035500000VFkjOAAT"
      };
      jsforceConnectionStub = sinon
        .stub(jsforce, "Connection")
        .returns(jsforceStub);

      try {
        await sfCtrl.updateSFContact(req, res);
        assert.called(jsforceConnectionStub);
        assert.called(jsforceStub.login);
        assert.calledWith(res.json, responseStub);
      } catch (err) {
        console.log(err);
      }
    });

    test("returns next if res.locals.next is set", async function() {
      next = sinon.stub();
      jsforceConnectionStub = sinon
        .stub(jsforce, "Connection")
        .returns(jsforceStub);
      res.locals.next = next;

      try {
        const result = await sfCtrl.updateSFContact(req, res, next);
        assert.called(jsforceConnectionStub);
        assert.called(jsforceStub.login);
        assert.match(result, next());
      } catch (err) {
        console.log(err);
      }
    });

    test("returns error if login fails", async function() {
      loginError =
        "Error: INVALID_LOGIN: Invalid username, password, security token; or user locked out.";
      loginStub = sinon.stub().throws(new Error(loginError));
      jsforceStub.login = loginStub;
      jsforceConnectionStub = sinon
        .stub(jsforce, "Connection")
        .returns(jsforceStub);

      const res = mockRes();
      const req = mockReq({
        body: submissionBody
      });
      try {
        await sfCtrl.updateSFContact(req, res);
        assert.called(jsforceConnectionStub);
        assert.called(jsforceStub.login);
        assert.calledWith(res.status, 500);
        assert.calledWith(res.json, { message: loginError });
      } catch (err) {
        console.log(err);
      }
    });

    test("returns error if sobject update fails", async function() {
      sobjectError =
        "NOT_FOUND: Provided external ID field does not exist or is not accessible: 123456789";
      jsforceSObjectUpdateStub = sinon.stub().throws(new Error(sobjectError));
      jsforceStub = {
        login: loginStub,
        sobject: sinon.stub().returns({ update: jsforceSObjectUpdateStub })
      };
      jsforceConnectionStub = sinon
        .stub(jsforce, "Connection")
        .returns(jsforceStub);

      const res = mockRes();
      const req = mockReq({
        body: submissionBody
      });
      try {
        await sfCtrl.updateSFContact(req, res);
        assert.called(jsforceConnectionStub);
        assert.called(jsforceStub.login);
        assert.calledWith(jsforceStub.sobject, "Contact");
        assert.calledWith(res.status, 500);
        assert.calledWith(res.json, { message: sobjectError });
      } catch (err) {
        console.log(err);
      }
    });
  });

  suite("sfCtrl > getAllEmployers", function() {
    beforeEach(function() {
      return new Promise(resolve => {
        req = mockReq();
        responseStub = [contactStub];
        queryStub = sinon.stub().returns((null, { records: responseStub }));
        loginStub = sinon.stub();
        jsforceStub = {
          login: loginStub,
          query: queryStub
        };
        jsforceConnectionStub = sinon
          .stub(jsforce, "Connection")
          .returns(jsforceStub);
        resolve();
      });
    });

    afterEach(() => {
      sinon.restore();
    });

    test("gets all Employers", async function() {
      query = `SELECT Id, Name, Sub_Division__c, Agency_Number__c FROM Account WHERE Id = '0014N00001iFKWWQA4' OR (RecordTypeId = '01261000000ksTuAAI' and Division__c IN ('Retirees', 'Public', 'Care Provider') and Sub_Division__c != null)`;
      try {
        await sfCtrl.getAllEmployers(req, res);
        assert.called(jsforceConnectionStub);
        assert.called(jsforceStub.login);
        assert.calledWith(jsforceStub.query, query);
        assert.calledWith(res.json, responseStub);
      } catch (err) {
        console.log(err);
      }
    });

    test("returns error if no employers found", async function() {
      queryError = "Error while fetching accounts";
      queryStub = sinon.stub().returns(new Error(queryError), null);
      jsforceStub.query = queryStub;

      try {
        await sfCtrl.getAllEmployers(req, res);
        assert.called(jsforceConnectionStub);
        assert.called(jsforceStub.query);
        assert.calledWith(res.status, 500);
        assert.calledWith(res.json, { message: queryError });
      } catch (err) {
        console.log(err);
      }
    });

    test("returns error if login fails", async function() {
      loginError =
        "Error: INVALID_LOGIN: Invalid username, password, security token; or user locked out.";
      loginStub = sinon.stub().throws(new Error(loginError));
      jsforceStub.login = loginStub;

      try {
        await sfCtrl.getAllEmployers(req, res);
        assert.called(jsforceConnectionStub);
        assert.called(jsforceStub.login);
        assert.calledWith(res.status, 500);
        assert.calledWith(res.json, { message: loginError });
      } catch (err) {
        console.log(err);
      }
    });

    test("returns error if query fails", async function() {
      queryError = "Error: MALFORMED_QUERY: unexpected token: query";
      queryStub = sinon.stub().throws(new Error(queryError));
      jsforceStub.query = queryStub;

      try {
        await sfCtrl.getAllEmployers(req, res);
        assert.called(jsforceConnectionStub);
        assert.called(jsforceStub.query);
        assert.calledWith(res.status, 500);
        assert.calledWith(res.json, { message: queryError });
      } catch (err) {
        console.log(err);
      }
    });
  });

  suite("sfCtrl > createSFOnlineMemberApp", function() {
    beforeEach(function() {
      return new Promise(resolve => {
        req = mockReq({
          body: submissionBody
        });
        res.locals = {
          sf_contact_id: "0035500000VFkjOAAT",
          submission_id: "0035500000VFkjOAAT"
        };
        contactStub = { id: "0035500000VFkjOAAT", success: true, errors: [] };
        jsforceSObjectCreateStub = sinon.stub().returns((null, contactStub));
        loginStub = sinon.stub();
        jsforceStub = {
          login: loginStub,
          sobject: sinon.stub().returns({
            create: jsforceSObjectCreateStub
          })
        };
        resolve();
      });
    });

    afterEach(() => {
      sinon.restore();
    });

    test("creates a SF OMA object", async function() {
      responseStub = {
        salesforce_id: "0035500000VFkjOAAT",
        submission_id: "0035500000VFkjOAAT",
        sf_OMA_id: "0035500000VFkjOAAT"
      };
      jsforceConnectionStub = sinon
        .stub(jsforce, "Connection")
        .returns(jsforceStub);

      try {
        await sfCtrl.createSFOnlineMemberApp(req, res);
        assert.called(jsforceConnectionStub);
        assert.called(jsforceStub.login);
        assert.calledWith(res.json, responseStub);
      } catch (err) {
        console.log(err);
      }
    });

    test("returns error if login fails", async function() {
      loginError =
        "Error: INVALID_LOGIN: Invalid username, password, security token; or user locked out.";
      loginStub = sinon.stub().throws(new Error(loginError));
      jsforceStub.login = loginStub;
      jsforceConnectionStub = sinon
        .stub(jsforce, "Connection")
        .returns(jsforceStub);

      try {
        await sfCtrl.createSFOnlineMemberApp(req, res);
        assert.called(jsforceConnectionStub);
        assert.called(jsforceStub.login);
        assert.calledWith(res.status, 500);
        assert.calledWith(res.json, { message: loginError });
      } catch (err) {
        console.log(err);
      }
    });

    test("returns error if sobject create fails", async function() {
      sobjectError =
        "NOT_FOUND: Provided external ID field does not exist or is not accessible: 123456789";
      jsforceSObjectCreateStub = sinon.stub().throws(new Error(sobjectError));
      jsforceStub = {
        login: loginStub,
        sobject: sinon.stub().returns({ create: jsforceSObjectCreateStub })
      };
      jsforceConnectionStub = sinon
        .stub(jsforce, "Connection")
        .returns(jsforceStub);

      try {
        await sfCtrl.createSFOnlineMemberApp(req, res);
        assert.called(jsforceConnectionStub);
        assert.called(jsforceStub.login);
        assert.calledWith(jsforceStub.sobject, "OnlineMemberApp__c");
        assert.calledWith(res.status, 500);
        assert.calledWith(res.json, { message: sobjectError });
      } catch (err) {
        console.log(err);
      }
    });
  });

  suite("sfCtrl > deleteSFOnlineMemberApp", function() {
    beforeEach(function() {
      return new Promise(resolve => {
        req = mockReq({
          params: {
            id: "123456789"
          }
        });
        responseStub = { message: "Successfully deleted contact" };
        jsforceSObjectDestroyStub = sinon.stub();
        loginStub = sinon.stub();
        jsforceStub = {
          login: loginStub,
          sobject: sinon.stub().returns({
            destroy: jsforceSObjectDestroyStub
          })
        };
        resolve();
      });
    });

    afterEach(() => {
      sinon.restore();
    });

    test("deletes an OMA by Id", async function() {
      responseStub = { message: "Successfully deleted Online Member App" };
      jsforceSObjectDestroyStub = sinon.stub();
      loginStub = sinon.stub();
      jsforceStub = {
        login: loginStub,
        sobject: sinon.stub().returns({
          destroy: jsforceSObjectDestroyStub
        })
      };
      jsforceConnectionStub = sinon
        .stub(jsforce, "Connection")
        .returns(jsforceStub);

      try {
        await sfCtrl.deleteSFOnlineMemberApp(req, res);
        assert.called(jsforceConnectionStub);
        assert.called(jsforceStub.login);
        assert.calledWith(res.json, responseStub);
      } catch (err) {
        console.log(err);
      }
    });

    test("returns error if login fails", async function() {
      loginError =
        "Error: INVALID_LOGIN: Invalid username, password, security token; or user locked out.";
      loginStub = sinon.stub().throws(new Error(loginError));
      jsforceStub.login = loginStub;
      jsforceConnectionStub = sinon
        .stub(jsforce, "Connection")
        .returns(jsforceStub);

      try {
        await sfCtrl.deleteSFOnlineMemberApp(req, res);
        assert.called(jsforceConnectionStub);
        assert.called(jsforceStub.login);
        assert.calledWith(res.status, 500);
        assert.calledWith(res.json, { message: loginError });
      } catch (err) {
        console.log(err);
      }
    });

    test("returns error if sobject destroy fails", async function() {
      sobjectError =
        "NOT_FOUND: Provided external ID field does not exist or is not accessible: 123456789";
      jsforceSObjectDestroyStub = sinon.stub().throws(new Error(sobjectError));
      jsforceStub = {
        login: loginStub,
        sobject: sinon.stub().returns({ destroy: jsforceSObjectDestroyStub })
      };
      jsforceConnectionStub = sinon
        .stub(jsforce, "Connection")
        .returns(jsforceStub);

      try {
        await sfCtrl.deleteSFOnlineMemberApp(req, res);
        assert.called(jsforceConnectionStub);
        assert.called(jsforceStub.login);
        assert.calledWith(jsforceStub.sobject, "OnlineMemberApp__c");
        assert.calledWith(res.status, 500);
        assert.calledWith(res.json, { message: sobjectError });
      } catch (err) {
        console.log(err);
      }
    });
  });

  suite("sfCtrl > getSFDJRById", function() {
    beforeEach(function() {
      return new Promise(resolve => {
        req = mockReq({
          params: {
            id: "123456789"
          }
        });
        responseStub = { records: [contactStub] };
        queryStub = sinon.stub().returns((null, responseStub));
        loginStub = sinon.stub();
        jsforceStub = {
          login: loginStub,
          query: queryStub
        };
        jsforceConnectionStub = sinon
          .stub(jsforce, "Connection")
          .returns(jsforceStub);
        resolve();
      });
    });

    afterEach(() => {
      sinon.restore();
    });

    test("gets a single DJR record by Contact Id", async function() {
      query = `SELECT ${paymentFieldList.join(
        ","
      )}, Id, Employer__c FROM Direct_join_rate__c WHERE Worker__c = \'123456789\'`;
      try {
        await sfCtrl.getSFDJRById(req, res);
        assert.called(jsforceConnectionStub);
        assert.called(jsforceStub.login);
        assert.calledWith(jsforceStub.query, query);
        assert.calledWith(res.json, contactStub);
      } catch (err) {
        console.log(err);
      }
    });

    test("returns error if login fails", async function() {
      loginError =
        "Error: INVALID_LOGIN: Invalid username, password, security token; or user locked out.";
      loginStub = sinon.stub().throws(new Error(loginError));
      jsforceStub.login = loginStub;

      try {
        await sfCtrl.getSFDJRById(req, res);
        assert.called(jsforceConnectionStub);
        assert.called(jsforceStub.login);
        assert.calledWith(res.status, 500);
        assert.calledWith(res.json, { message: loginError });
      } catch (err) {
        console.log(err);
      }
    });

    test("returns error if query fails", async function() {
      queryError = "Error: MALFORMED_QUERY: unexpected token: query";
      queryStub = sinon.stub().throws(new Error(queryError));
      jsforceStub.query = queryStub;

      try {
        await sfCtrl.getSFDJRById(req, res);
        assert.called(jsforceConnectionStub);
        assert.called(jsforceStub.query);
        assert.calledWith(res.status, 500);
        assert.calledWith(res.json, { message: queryError });
      } catch (err) {
        console.log(err);
      }
    });
  });

  suite("sfCtrl > createSFDJR", function() {
    beforeEach(function() {
      return new Promise(resolve => {
        req = mockReq({
          body: djrBody
        });
        jsforceSObjectCreateStub = sinon
          .stub()
          .returns((null, { Id: "0035500000VFkjOAAT" }));
        loginStub = sinon.stub();
        jsforceStub = {
          login: loginStub,
          sobject: sinon.stub().returns({
            create: jsforceSObjectCreateStub
          })
        };
        resolve();
      });
    });

    afterEach(() => {
      sinon.restore();
    });

    test("creates a single DJR record", async function() {
      responseStub = { sf_djr_id: "0035500000VFkjOAAT" };
      jsforceConnectionStub = sinon
        .stub(jsforce, "Connection")
        .returns(jsforceStub);

      try {
        await sfCtrl.createSFDJR(req, res);
        assert.called(jsforceConnectionStub);
        assert.called(jsforceStub.login);
        assert.calledWith(res.json, responseStub);
      } catch (err) {
        console.log(err);
      }
    });

    test("returns error if login fails", async function() {
      loginError =
        "Error: INVALID_LOGIN: Invalid username, password, security token; or user locked out.";
      loginStub = sinon.stub().throws(new Error(loginError));
      jsforceStub.login = loginStub;
      jsforceConnectionStub = sinon
        .stub(jsforce, "Connection")
        .returns(jsforceStub);

      const res = mockRes();
      const req = mockReq({
        body: djrBody
      });
      try {
        await sfCtrl.createSFDJR(req, res);
        assert.called(jsforceConnectionStub);
        assert.called(jsforceStub.login);
        assert.calledWith(res.status, 500);
        assert.calledWith(res.json, { message: loginError });
      } catch (err) {
        console.log(err);
      }
    });

    test("returns error if sobject create fails", async function() {
      sobjectError =
        "NOT_FOUND: Provided external ID field does not exist or is not accessible: 123456789";
      jsforceSObjectCreateStub = sinon.stub().throws(new Error(sobjectError));
      jsforceStub = {
        login: loginStub,
        sobject: sinon.stub().returns({ create: jsforceSObjectCreateStub })
      };
      jsforceConnectionStub = sinon
        .stub(jsforce, "Connection")
        .returns(jsforceStub);

      const res = mockRes();
      const req = mockReq({
        body: djrBody
      });
      try {
        await sfCtrl.createSFDJR(req, res);
        assert.called(jsforceConnectionStub);
        assert.called(jsforceStub.login);
        assert.calledWith(jsforceStub.sobject, "Direct_join_rate__c");
        assert.calledWith(res.status, 500);
        assert.calledWith(res.json, { message: sobjectError });
      } catch (err) {
        console.log(err);
      }
    });
  });

  suite("sfCtrl > updateSFDJR", function() {
    beforeEach(function() {
      return new Promise(resolve => {
        req = mockReq({
          body: submissionBody
        });
        jsforceSObjectUpdateStub = sinon
          .stub()
          .returns((null, { Id: "sfid0035500000VFkjOAAT" }));
        loginStub = sinon.stub();
        jsforceStub = {
          login: loginStub,
          sobject: sinon.stub().returns({
            update: jsforceSObjectUpdateStub
          })
        };
        resolve();
      });
    });

    afterEach(() => {
      sinon.restore();
    });

    test("updates a SF DJR record", async function() {
      responseStub = {
        sf_djr_id: "sfid0035500000VFkjOAAT"
      };
      req.params = {
        id: "sfid0035500000VFkjOAAT"
      };
      res.locals = {
        sf_djr_id: "sfid0035500000VFkjOAAT"
      };
      jsforceConnectionStub = sinon
        .stub(jsforce, "Connection")
        .returns(jsforceStub);

      try {
        await sfCtrl.updateSFDJR(req, res);
        assert.called(jsforceConnectionStub);
        assert.called(jsforceStub.login);
        assert.calledWith(res.json, responseStub);
      } catch (err) {
        console.log(err);
      }
    });

    test("returns error if login fails", async function() {
      loginError =
        "Error: INVALID_LOGIN: Invalid username, password, security token; or user locked out.";
      loginStub = sinon.stub().throws(new Error(loginError));
      jsforceStub.login = loginStub;
      jsforceConnectionStub = sinon
        .stub(jsforce, "Connection")
        .returns(jsforceStub);

      const res = mockRes();
      const req = mockReq({
        body: djrBody
      });
      try {
        await sfCtrl.updateSFDJR(req, res);
        assert.called(jsforceConnectionStub);
        assert.called(jsforceStub.login);
        assert.calledWith(res.status, 500);
        assert.calledWith(res.json, { message: loginError });
      } catch (err) {
        console.log(err);
      }
    });

    test("returns error if sobject update fails", async function() {
      sobjectError =
        "NOT_FOUND: Provided external ID field does not exist or is not accessible: 123456789";
      jsforceSObjectUpdateStub = sinon.stub().throws(new Error(sobjectError));
      jsforceStub = {
        login: loginStub,
        sobject: sinon.stub().returns({ update: jsforceSObjectUpdateStub })
      };
      jsforceConnectionStub = sinon
        .stub(jsforce, "Connection")
        .returns(jsforceStub);

      const res = mockRes();
      const req = mockReq({
        body: djrBody
      });
      try {
        await sfCtrl.updateSFDJR(req, res);
        assert.called(jsforceConnectionStub);
        assert.called(jsforceStub.login);
        assert.calledWith(jsforceStub.sobject, "Direct_join_rate__c");
        assert.calledWith(res.status, 500);
        assert.calledWith(res.json, { message: sobjectError });
      } catch (err) {
        console.log(err);
      }
    });
  });

  suite("sfCtrl > getUnioniseToken", function() {
    afterEach(() => {
      nock.cleanAll();
      sinon.restore();
    });

    test("gets a unionise access token", async function() {
      const app = require("../server");
      responseStub = { access_token: "faketoken" };
      nock("https://auth-dev.unioni.se")
        .post("/auth/realms/lab-api/protocol/openid-connect/token")
        .reply(200, { data: responseStub });
      // chai
      //   .request(app)
      //   .post("/api/unionise/gettoken")
      //   .end(function(err, res) {
      //     expect(res.status).to.equal(200);
      //     expect(res.data).to.equal(responseStub);
      //   });
    });

    test("returns error if no access token in response", async function() {
      const app = require("../server");
      unioniseError = "Error while fetching access token";
      responseStub = { message: unioniseError };
      nock("https://auth-dev.unioni.se")
        .post("/auth/realms/lab-api/protocol/openid-connect/token")
        .reply(500, { data: responseStub });
      // chai
      //   .request(app)
      //   .post("/api/unionise/gettoken")
      //   .end(function(err, res) {
      //     expect(res.status).to.equal(500);
      //     expect(res.data).to.equal(responseStub);
      //   });
    });

    test("returns error if unionise api call throws", async function() {
      const app = require("../server");
      unioniseError = new Error("Error while fetching access token");
      responseStub = { message: unioniseError };
      nock("https://auth-dev.unioni.se")
        .post("/auth/realms/lab-api/protocol/openid-connect/token")
        .reply(500, unioniseError);
      // chai
      //   .request(app)
      //   .post("/api/unionise/gettoken")
      //   .end(function(err, res) {
      //     expect(res.status).to.equal(500);
      //     console.log("controllers_sf_spec > 1286");
      //     console.log(res.error);
      //     expect(res.error.message).to.equal(unioniseError);
      //   });
    });
  });

  suite("sfCtrl > getIframeExisting", function() {
    afterEach(() => {
      nock.cleanAll();
      sinon.restore();
    });

    test("gets a card adding iframe for an existing unionise member", async function() {
      const app = require("../server");
      responseStub = { cardAddingUrl: "http://www.url.com" };
      nock("https://lab.unioni.se")
        .post("/api/v1/members/123ABC/generate-payment-method-iframe-url")
        .reply(200, { data: responseStub });
      // chai
      //   .request(app)
      //   .post("/api/unionise/iframe")
      //   .set({ Authorization: "Bearer 12345" })
      //   .send({ memberShortId: "123ABC" })
      //   .end(function(err, res) {
      //     expect(res.status).to.equal(200);
      //     expect(res.data).to.equal(responseStub);
      //   });
    });

    test("returns error if no access token in response", async function() {
      const app = require("../server");
      unioniseError = "Error while fetching iframe";
      responseStub = { message: unioniseError };
      nock("https://lab.unioni.se")
        .post("/v1/members/123ABC/generate-payment-method-iframe-url")
        .reply(500, { data: responseStub });
      // chai
      //   .request(app)
      //   .post("/api/unionise/iframe")
      //   .set({ Authorization: "Bearer 12345" })
      //   .send({ memberShortId: "123ABC" })
      //   .end(function(err, res) {
      //     expect(res.status).to.equal(500);
      //     expect(res.data).to.equal(responseStub);
      //   });
    });

    test("returns error if unionise api call throws", async function() {
      const app = require("../server");
      unioniseError = new Error("Error while fetching iframe");
      responseStub = { message: unioniseError };
      nock("https://lab.unioni.se")
        .post("/v1/members/123ABC/generate-payment-method-iframe-url")
        .reply(500, { data: responseStub });
      // chai
      //   .request(app)
      //   .post("/api/unionise/iframe")
      //   .set({ Authorization: "Bearer 12345" })
      //   .end(function(err, res) {
      //     expect(res.status).to.equal(500);
      //     console.log("controllers_sf_spec > 1345");
      //     console.log(res.error);
      //     console.log(res.err);
      //     expect(res.error).to.equal(unioniseError);
      //   });
    });
  });

  // suite("sfCtrl > postPaymentRequest", function() {
  //   afterEach(() => {
  //     nock.cleanAll();
  //     sinon.restore();
  //   });

  // test("posts a one-time payment request to unionise", async function() {
  //   const app = require("../server");
  //   const body = {
  //     memberShortId: "J7K5HYDQ",
  //     amount: {
  //       currency: "USD",
  //       amount: 1.1
  //     },
  //     paymentPartType: "CAPE",
  //     description: "One-time CAPE contribution",
  //     plannedDatetime: new Date()
  //   };
  //   responseStub = { id: "a07dbd65-9f34-40e6-a203-5406302b8c75" };
  //   nock("https://lab.unioni.se")
  //     .post("/api/v1/paymentRequests")
  //     .reply(200, { data: responseStub });
  //   chai
  //     .request(app)
  //     .post("/api/unionise/oneTimePayment")
  //     .set({ Authorization: "Bearer 12345" })
  //     .send(body)
  //     .end(function(err, res) {
  //       expect(res.status).to.equal(200);
  //       expect(res.data).to.equal(responseStub);
  //     });
  // });

  // test("returns error if no access token in response", async function() {
  //   const app = require("../server");
  //   const body = {
  //     memberShortId: "J7K5HYDQ",
  //     amount: {
  //       currency: "USD",
  //       amount: 1.1
  //     },
  //     paymentPartType: "CAPE",
  //     description: "One-time CAPE contribution",
  //     plannedDatetime: new Date()
  //   };
  //   unioniseError = "Error while posting payment request";
  //   responseStub = { message: unioniseError };
  //   nock("https://lab.unioni.se")
  //     .post("/api/v1/paymentRequests")
  //     .reply(500, { ...responseStub });
  //   chai
  //     .request(app)
  //     .post("/api/unionise/oneTimePayment")
  //     .set({ Authorization: "Bearer 12345" })
  //     .send(body)
  //     .end(function(err, res) {
  //       expect(res.status).to.equal(500);
  //       expect(res.data).to.equal(responseStub);
  //     });
  // });

  // test("returns error if unionise api call throws", async function() {
  //   const app = require("../server");
  //   const body = {
  //     memberShortId: "J7K5HYDQ",
  //     amount: {
  //       currency: "USD",
  //       amount: 1.1
  //     },
  //     paymentPartType: "CAPE",
  //     description: "One-time CAPE contribution",
  //     plannedDatetime: new Date()
  //   };
  //   unioniseError = new Error("Error while posting payment request");
  //   responseStub = unioniseError;
  //   nock("https://lab.unioni.se")
  //     .post("/api/v1/paymentRequests")
  //     .reply(500, responseStub);
  //   chai
  //     .request(app)
  //     .post("/api/unionise/oneTimePayment")
  //     .set({ Authorization: "Bearer 12345" })
  //     .send(body)
  //     .end(function(err, res) {
  //       expect(res.status).to.equal(500);
  //       console.log("controllers_sf_spec > 1434");
  //       console.log(res.error);
  //       expect(res.error).to.equal(unioniseError);
  //     });
  // });
  // });

  suite("sfCtrl > createSFCAPE", function() {
    beforeEach(function() {
      return new Promise(resolve => {
        req = mockReq({
          body: {
            ...capeBody
          }
        });
        responseStub = { cape_id: contactStub.id };
        jsforceSObjectCreateStub = sinon.stub().returns((null, contactStub));
        loginStub = sinon.stub();
        jsforceStub = {
          login: loginStub,
          sobject: sinon.stub().returns({
            create: jsforceSObjectCreateStub
          })
        };
        resolve();
      });
    });

    afterEach(() => {
      sinon.restore();
    });

    test("creates a CAPE record", async function() {
      responseStub = { sf_cape_id: "0035500000VFkjOAAT" };
      jsforceConnectionStub = sinon
        .stub(jsforce, "Connection")
        .returns(jsforceStub);
      try {
        await sfCtrl.createSFCAPE(req, res);
        assert.called(jsforceConnectionStub);
        assert.called(jsforceStub.login);
        assert.calledWith(res.json, responseStub);
      } catch (err) {
        console.log(err);
      }
    });

    test("returns error if login fails", async function() {
      loginError =
        "Error: INVALID_LOGIN: Invalid username, password, security token; or user locked out.";
      loginStub = sinon.stub().throws(new Error(loginError));
      jsforceStub.login = loginStub;
      jsforceConnectionStub = sinon
        .stub(jsforce, "Connection")
        .returns(jsforceStub);

      try {
        await sfCtrl.createSFCAPE(req, res);
        assert.called(jsforceConnectionStub);
        assert.called(jsforceStub.login);
        assert.calledWith(res.status, 500);
        assert.calledWith(res.json, { message: loginError });
      } catch (err) {
        console.log(err);
      }
    });

    test("returns error if sobject create fails", async function() {
      sobjectError =
        "NOT_FOUND: Provided external ID field does not exist or is not accessible: 123456789";
      jsforceSObjectCreateStub = sinon.stub().throws(new Error(sobjectError));
      jsforceStub = {
        login: loginStub,
        sobject: sinon.stub().returns({ create: jsforceSObjectCreateStub })
      };
      jsforceConnectionStub = sinon
        .stub(jsforce, "Connection")
        .returns(jsforceStub);

      const res = mockRes();
      const req = mockReq({
        body: capeBody
      });
      try {
        await sfCtrl.createSFCAPE(req, res);
        assert.called(jsforceConnectionStub);
        assert.called(jsforceStub.login);
        assert.calledWith(jsforceStub.sobject, "CAPE__c");
        assert.calledWith(res.status, 500);
        assert.calledWith(res.json, { message: sobjectError });
      } catch (err) {
        console.log(err);
      }
    });
  });

  suite("sfCtrl > updateSFCAPE", function() {
    suite("unioni.se event request", function() {
      beforeEach(function() {
        return new Promise(resolve => {
          req = mockReq({
            body: {
              info: {
                paymentId: "123"
              },
              eventType: "finish"
            }
          });
          responseStub = [contactStub];
          jsforceSObjectUpdateStub = sinon.stub().returns((null, responseStub));
          loginStub = sinon.stub();
          jsforceStub = {
            login: loginStub,
            sobject: sinon.stub().returns({
              find: sinon.stub().returns({
                update: jsforceSObjectUpdateStub
              })
            })
          };
          resolve();
        });
      });

      afterEach(() => {
        sinon.restore();
      });

      test("updates a CAPE record", async function() {
        responseStub = { message: "Updated payment status successfully" };
        jsforceConnectionStub = sinon
          .stub(jsforce, "Connection")
          .returns(jsforceStub);
        try {
          await sfCtrl.updateSFCAPE(req, res);
          assert.called(jsforceConnectionStub);
          assert.called(jsforceStub.login);
          assert.calledWith(res.json, responseStub);
        } catch (err) {
          console.log(err);
        }
      });

      test("returns error if login fails", async function() {
        loginError =
          "Error: INVALID_LOGIN: Invalid username, password, security token; or user locked out.";
        loginStub = sinon.stub().throws(new Error(loginError));
        jsforceStub.login = loginStub;
        jsforceConnectionStub = sinon
          .stub(jsforce, "Connection")
          .returns(jsforceStub);

        try {
          await sfCtrl.updateSFCAPE(req, res);
          assert.called(jsforceConnectionStub);
          assert.called(jsforceStub.login);
          assert.calledWith(res.status, 500);
          assert.calledWith(res.json, { message: loginError });
        } catch (err) {
          console.log(err);
        }
      });

      test("returns error if sobject update fails", async function() {
        sobjectError =
          "NOT_FOUND: Provided external ID field does not exist or is not accessible: 123456789";
        jsforceSObjectUpdateStub = sinon.stub().throws(new Error(sobjectError));
        jsforceStub = {
          login: loginStub,
          sobject: sinon.stub().returns({
            find: sinon.stub().returns({
              update: jsforceSObjectUpdateStub
            })
          })
        };
        jsforceConnectionStub = sinon
          .stub(jsforce, "Connection")
          .returns(jsforceStub);

        const res = mockRes();
        const req = mockReq({
          body: {
            info: {
              paymentId: "123"
            },
            eventType: "finish"
          }
        });
        try {
          await sfCtrl.updateSFCAPE(req, res);
          assert.called(jsforceConnectionStub);
          assert.called(jsforceStub.login);
          assert.calledWith(jsforceStub.sobject, "CAPE__c");
          assert.calledWith(res.status, 404);
          assert.calledWith(res.json, { message: sobjectError });
        } catch (err) {
          console.log(err);
        }
      });

      test("returns error if body has info key but no eventType", async function() {
        sobjectError = "No eventType submitted";
        jsforceSObjectUpdateStub = sinon
          .stub()
          .returns({ message: sobjectError });
        jsforceStub = {
          login: loginStub,
          sobject: sinon.stub().returns({
            find: sinon.stub().returns({
              update: jsforceSObjectUpdateStub
            })
          })
        };
        jsforceConnectionStub = sinon
          .stub(jsforce, "Connection")
          .returns(jsforceStub);

        const res = mockRes();
        const req = mockReq({
          body: {
            info: {
              paymentId: "123"
            },
            eventType: null
          }
        });
        try {
          await sfCtrl.updateSFCAPE(req, res);
          assert.notCalled(jsforceConnectionStub);
          assert.notCalled(jsforceStub.login);
          assert.calledWith(res.status, 422);
          assert.calledWith(res.json, { message: sobjectError });
        } catch (err) {
          console.log(err);
        }
      });

      test("returns error if body has One_Time_Payment_Id__c key but no Id", async function() {
        sobjectError = "No CAPE__c Id submitted";
        jsforceSObjectUpdateStub = sinon
          .stub()
          .returns({ message: sobjectError });
        jsforceStub = {
          login: loginStub,
          sobject: sinon.stub().returns({
            find: sinon.stub().returns({
              update: jsforceSObjectUpdateStub
            })
          })
        };
        jsforceConnectionStub = sinon
          .stub(jsforce, "Connection")
          .returns(jsforceStub);

        const res = mockRes();
        const req = mockReq({
          body: {
            One_Time_Payment_Id__c: "123"
          }
        });
        try {
          await sfCtrl.updateSFCAPE(req, res);
          assert.notCalled(jsforceConnectionStub);
          assert.notCalled(jsforceStub.login);
          assert.calledWith(res.status, 422);
          assert.calledWith(res.json, { message: sobjectError });
        } catch (err) {
          console.log(err);
        }
      });

      test("returns error if no payment id in body", async function() {
        sobjectError = "No payment Id submitted";
        jsforceSObjectUpdateStub = sinon
          .stub()
          .returns({ message: sobjectError });
        jsforceStub = {
          login: loginStub,
          sobject: sinon.stub().returns({
            find: sinon.stub().returns({
              update: jsforceSObjectUpdateStub
            })
          })
        };
        jsforceConnectionStub = sinon
          .stub(jsforce, "Connection")
          .returns(jsforceStub);

        const res = mockRes();
        const req = mockReq({
          body: {
            Id: "123"
          }
        });
        try {
          await sfCtrl.updateSFCAPE(req, res);
          assert.notCalled(jsforceConnectionStub);
          assert.notCalled(jsforceStub.login);
          assert.calledWith(res.status, 422);
          assert.calledWith(res.json, { message: sobjectError });
        } catch (err) {
          console.log(err);
        }
      });

      test("returns error if sobject find returns no record", async function() {
        sobjectError = `No matching record found for payment id 123, Error0`;
        const contactErrorStub = { ...contactStub };
        contactErrorStub.errors = ["Error0"];
        contactErrorStub.success = false;
        responseStub = [contactErrorStub];
        jsforceSObjectUpdateStub = sinon.stub().returns((null, responseStub));
        jsforceStub = {
          login: loginStub,
          sobject: sinon.stub().returns({
            find: sinon.stub().returns({
              update: jsforceSObjectUpdateStub
            })
          })
        };
        jsforceConnectionStub = sinon
          .stub(jsforce, "Connection")
          .returns(jsforceStub);

        const res = mockRes();
        const req = mockReq({
          body: {
            info: {
              paymentId: "123"
            },
            eventType: "finish"
          }
        });
        try {
          await sfCtrl.updateSFCAPE(req, res);
          assert.called(jsforceConnectionStub);
          assert.called(jsforceStub.login);
          assert.calledWith(jsforceStub.sobject, "CAPE__c");
          assert.calledWith(res.status, 404);
          assert.calledWith(res.json, { message: sobjectError });
        } catch (err) {
          console.log(err);
        }
      });
    });
    suite("member app request", function() {
      beforeEach(function() {
        return new Promise(resolve => {
          req = mockReq({
            body: {
              Id: "123",
              One_Time_Payment_Id__c: "456"
            }
          });
          responseStub = [contactStub];
          jsforceSObjectUpdateStub = sinon
            .stub()
            .returns((null, [contactStub]));
          loginStub = sinon.stub();
          jsforceStub = {
            login: loginStub,
            sobject: sinon.stub().returns({
              update: jsforceSObjectUpdateStub
            })
          };
          resolve();
        });
      });

      afterEach(() => {
        sinon.restore();
      });

      test("updates a CAPE record", async function() {
        jsforceConnectionStub = sinon
          .stub(jsforce, "Connection")
          .returns(jsforceStub);
        try {
          await sfCtrl.updateSFCAPE(req, res);
          assert.called(jsforceConnectionStub);
          assert.called(jsforceStub.login);
          assert.calledWith(res.json, {
            message: "Updated payment Id successfully"
          });
        } catch (err) {
          console.log(err);
        }
      });

      test("returns error if login fails", async function() {
        loginError =
          "Error: INVALID_LOGIN: Invalid username, password, security token; or user locked out.";
        loginStub = sinon.stub().throws(new Error(loginError));
        jsforceStub.login = loginStub;
        jsforceConnectionStub = sinon
          .stub(jsforce, "Connection")
          .returns(jsforceStub);

        try {
          await sfCtrl.updateSFCAPE(req, res);
          assert.called(jsforceConnectionStub);
          assert.called(jsforceStub.login);
          assert.calledWith(res.status, 500);
          assert.calledWith(res.json, { message: loginError });
        } catch (err) {
          console.log(err);
        }
      });

      test("returns error if sobject update fails", async function() {
        sobjectError =
          "NOT_FOUND: Provided external ID field does not exist or is not accessible: 123456789";
        jsforceSObjectUpdateStub = sinon.stub().throws(new Error(sobjectError));
        jsforceStub = {
          login: loginStub,
          sobject: sinon.stub().returns({ update: jsforceSObjectUpdateStub })
        };
        jsforceConnectionStub = sinon
          .stub(jsforce, "Connection")
          .returns(jsforceStub);

        const res = mockRes();
        const req = mockReq({
          body: {
            Id: "123",
            One_Time_Payment_Id__c: "456"
          }
        });
        try {
          await sfCtrl.updateSFCAPE(req, res);
          assert.called(jsforceConnectionStub);
          assert.called(jsforceStub.login);
          assert.calledWith(jsforceStub.sobject, "CAPE__c");
          assert.calledWith(res.status, 404);
          assert.calledWith(res.json, { message: sobjectError });
        } catch (err) {
          console.log(err);
        }
      });

      test("returns error if sobject update returns no record", async function() {
        sobjectError = `No matching record found for payment id 123, Error0`;
        const contactErrorStub = { ...contactStub };
        contactErrorStub.errors = ["Error0"];
        contactErrorStub.success = false;
        responseStub = [contactErrorStub];
        jsforceSObjectUpdateStub = sinon.stub().returns((null, responseStub));
        jsforceStub = {
          login: loginStub,
          sobject: sinon.stub().returns({
            update: jsforceSObjectUpdateStub
          })
        };
        jsforceConnectionStub = sinon
          .stub(jsforce, "Connection")
          .returns(jsforceStub);

        const res = mockRes();
        const req = mockReq({
          body: {
            Id: "123",
            One_Time_Payment_Id__c: "456"
          }
        });
        try {
          await sfCtrl.updateSFCAPE(req, res);
          assert.called(jsforceConnectionStub);
          assert.called(jsforceStub.login);
          assert.calledWith(jsforceStub.sobject, "CAPE__c");
          assert.calledWith(res.status, 404);
          assert.calledWith(res.json, { message: sobjectError });
        } catch (err) {
          console.log(err);
        }
      });
    });
  });
});
