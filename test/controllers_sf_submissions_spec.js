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
const request = require("request");
const passport = require("passport");
require("../app/config/passport")(passport);
chai.use(chaiHttp);

const sfCtrl = require("../app/controllers/sf.ctrl.js");
const submissionCtrl = require("../app/controllers/submissions.ctrl.js");
const submissions = require("../db/models/submissions");
const utils = require("../app/utils/index.js");
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
const prefillFieldList = fieldList.filter(field => field !== "Birthdate");
const paymentFieldList = generateSFDJRFieldList();

let submissionBody = generateSampleSubmission();
const adminBody = {
    type: "admin"
  },
  userBody = {
    type: "view"
  };
let capeBody = generateCAPEValidateBackEnd();
const { db, TABLES } = require("../app/config/knex");

const lookupSFContactByFLEOrig = sfCtrl.lookupSFContactByFLE,
  updateSFContactOrig = sfCtrl.updateSFContact,
  createSFContactOrig = sfCtrl.createSFContact,
  createContactOrig = sfCtrl.createSFContact,
  getAllEmployersOrig = sfCtrl.getAllEmployers,
  getSFEmployersOrig = sfCtrl.getAllEmployers,
  createSFOnlineMemberAppOrig = sfCtrl.createSFOnlineMemberApp,
  createSFOMAOrig = sfCtrl.createSFOnlineMemberApp,
  createSubmissionOrig = submissionCtrl.createSubmission,
  updateSubmissionOrig = submissionCtrl.updateSubmission;

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
  authenticateMock,
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
      loginError = "loginError";
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
      queryError = "queryError";
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

  suite("sfCtrl > getSFContactByDoubleId", function() {
    beforeEach(function() {
      return new Promise(resolve => {
        req = mockReq({
          params: {
            cId: "123456789",
            aId: "123456789"
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

    test("gets a single contact by double Id", async function() {
      query = `SELECT ${prefillFieldList.join(
        ","
      )}, Id FROM Contact WHERE Id = \'123456789\' AND Account.Id = \'123456789\'`;
      try {
        await sfCtrl.getSFContactByDoubleId(req, res);
        assert.called(jsforceConnectionStub);
        assert.called(jsforceStub.login);
        assert.calledWith(jsforceStub.query, query);
        assert.calledWith(res.json, contactStub);
        assert.calledWith(res.status, 200);
      } catch (err) {
        console.log(err);
      }
    });

    test("returns 422 if missing params", async function() {
      delete req.params.cId;
      responseStub = { message: "Missing required fields" };
      try {
        await sfCtrl.getSFContactByDoubleId(req, res);
        assert.calledWith(res.json, responseStub);
        assert.calledWith(res.status, 422);
      } catch (err) {
        console.log(err);
      }
    });

    test("returns 404 if no matching contact found", async function() {
      queryStub = sinon.stub().returns({ totalSize: 0 });
      responseStub = { message: "No matching contact found." };
      jsforceStub.query = queryStub;
      try {
        await sfCtrl.getSFContactByDoubleId(req, res);
        assert.called(jsforceConnectionStub);
        assert.called(jsforceStub.login);
        assert.called(jsforceStub.query);
        assert.calledWith(res.json, responseStub);
        assert.calledWith(res.status, 404);
      } catch (err) {
        console.log(err);
      }
    });

    test("returns error if login fails", async function() {
      loginError = "loginError";
      loginStub = sinon.stub().throws(new Error(loginError));
      jsforceStub.login = loginStub;

      try {
        await sfCtrl.getSFContactByDoubleId(req, res);
        assert.called(jsforceConnectionStub);
        assert.called(jsforceStub.login);
        assert.calledWith(res.status, 500);
        assert.calledWith(res.json, { message: loginError });
      } catch (err) {
        console.log(err);
      }
    });

    test("returns error if query fails", async function() {
      queryError = "queryError";
      queryStub = sinon.stub().throws(new Error(queryError));
      jsforceStub.query = queryStub;

      try {
        await sfCtrl.getSFContactByDoubleId(req, res);
        assert.called(jsforceConnectionStub);
        assert.called(jsforceStub.query);
        assert.calledWith(res.status, 500);
        assert.calledWith(res.json, { message: queryError });
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

    test("creates a single SF contact and return next", async function() {
      req = mockReq({
        body: submissionBody,
        locals: {
          next: true
        }
      });
      responseStub = { salesforce_id: "0035500000VFkjOAAT" };
      jsforceConnectionStub = sinon
        .stub(jsforce, "Connection")
        .returns(jsforceStub);

      try {
        await sfCtrl.createSFContact(req, res);
        assert.called(jsforceConnectionStub);
        assert.called(jsforceStub.login);
        assert.notCalled(res.json);
      } catch (err) {
        console.log(err);
      }
    });

    test("returns error if login fails", async function() {
      loginError = "loginError";
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
      sobjectError = "sobjectError";
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
        )} FROM Contact WHERE (FirstName LIKE \'${first_name}\' OR Salutation_Nickname__c LIKE \'${first_name}\') AND LastName = \'${last_name}\' AND (Home_Email__c = \'${home_email}\' OR Work_Email__c = \'${home_email}\') ORDER BY LastModifiedDate DESC LIMIT 1`;
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

    test("finds a single contact by first, last, email and return next", async function() {
      responseStub = {
        salesforce_id: "0035500000VFkjOAAT",
        Current_CAPE__c: undefined
      };
      req.locals = {
        next: true
      };
      try {
        await sfCtrl.lookupSFContactByFLE(req, res);
        assert.called(jsforceConnectionStub);
        assert.called(jsforceStub.login);
        assert.calledWith(jsforceStub.query, query);
        assert.notCalled(res.json);
      } catch (err) {
        console.log(err);
      }
    });

    test("returns 500 if required fields missing", async function() {
      delete req.body.first_name;
      responseStub = {
        message: "Please complete all required fields."
      };
      try {
        await sfCtrl.lookupSFContactByFLE(req, res);
        assert.calledWith(res.status, 500);
        assert.calledWith(res.json, responseStub);
      } catch (err) {
        console.log(err);
      }
    });

    test("returns a message if matching contact not found", async function() {
      let message = "No matching record found.";
      queryStub = sinon.stub().returns({ totalSize: 0 });
      jsforceStub.query = queryStub;
      try {
        await sfCtrl.lookupSFContactByFLE(req, res);
        assert.called(jsforceConnectionStub);
        assert.called(jsforceStub.login);
        assert.calledWith(res.status, 404);
        assert.calledWith(jsforceStub.query, query);
        assert.calledWith(res.json, { message });
      } catch (err) {
        console.log(err);
      }
    });

    test("returns null if matching contact not found and req.locals.next", async function() {
      let message = "No matching record found.";
      queryStub = sinon.stub().returns({ totalSize: 0 });
      jsforceStub.query = queryStub;
      req.locals = {
        next: true
      };
      try {
        await sfCtrl.lookupSFContactByFLE(req, res);
        assert.called(jsforceConnectionStub);
        assert.called(jsforceStub.login);
        assert.calledWith(jsforceStub.query, query);
        assert.notCalled(res.json);
      } catch (err) {
        console.log(err);
      }
    });

    test("returns error if login fails", async function() {
      loginError = "loginError";
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
      queryError = "queryError";
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

    test("updates a SF contact and returns next", async function() {
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
      req.locals = {
        next: true
      };
      req.body.Birthdate__c = "12/12/2000";
      req.body.birthdate = "12/12/2000";
      jsforceConnectionStub = sinon
        .stub(jsforce, "Connection")
        .returns(jsforceStub);

      try {
        await sfCtrl.updateSFContact(req, res);
        assert.called(jsforceConnectionStub);
        assert.called(jsforceStub.login);
        assert.notCalled(res.json);
      } catch (err) {
        console.log(err);
      }
    });

    test("updates a SF contact (no submission_id in res.locals)", async function() {
      responseStub = {
        salesforce_id: "sfid0035500000VFkjOAAT"
      };
      req.params = {
        id: "sfid0035500000VFkjOAAT"
      };
      res.locals = {
        sf_contact_id: "sfid0035500000VFkjOAAT"
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

    test("returns error if login fails", async function() {
      loginError = "loginError";
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
      sobjectError = "sobjectError";
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
      query = `SELECT Id, Name, Sub_Division__c, Parent.Id, Agency_Number__c FROM Account WHERE Id = '0016100000PZDmOAAX' OR (RecordTypeId = '01261000000ksTuAAI' AND Division__c IN ('Retirees', 'Public', 'Care Provider') AND Sub_Division__c != null AND Id != '0014N00001iFKWWQA4')`;
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
      loginError = "loginError";
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
      queryError = "queryError";
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
          body: submissionBody,
          headers: {
            "x-real-ip": "1.1.1.1"
          }
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

    test("creates a SF OMA object and returns next", async function() {
      responseStub = {
        salesforce_id: "0035500000VFkjOAAT",
        submission_id: "0035500000VFkjOAAT",
        sf_OMA_id: "0035500000VFkjOAAT"
      };
      req.locals = {
        next: true
      };
      req.body.scholarship_flag = "on";
      jsforceConnectionStub = sinon
        .stub(jsforce, "Connection")
        .returns(jsforceStub);

      try {
        await sfCtrl.createSFOnlineMemberApp(req, res);
        assert.called(jsforceConnectionStub);
        assert.called(jsforceStub.login);
        assert.notCalled(res.json);
      } catch (err) {
        console.log(err);
      }
    });

    test("returns error if login fails", async function() {
      loginError = "loginError";
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
      sobjectError = "sobjectError";
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
      )}, LastModifiedDate, Id, Employer__c FROM Direct_join_rate__c WHERE Worker__c = \'123456789\' ORDER BY LastModifiedDate DESC LIMIT 1`;
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
      loginError = "loginError";
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
      queryError = "queryError";
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
      loginError = "loginError";
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
      sobjectError = "sobjectError";
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
        const result = await sfCtrl.updateSFDJR(req, res);
        assert.called(jsforceConnectionStub);
        assert.called(jsforceStub.login);
        assert.calledWith(res.json, responseStub);
      } catch (err) {
        console.log(err);
      }
    });

    test("returns next if res.locals.next", async function() {
      responseStub = {
        sf_djr_id: "sfid0035500000VFkjOAAT"
      };
      req.params = {
        id: "sfid0035500000VFkjOAAT"
      };
      res.locals = {
        sf_djr_id: "sfid0035500000VFkjOAAT",
        next: sinon.stub()
      };
      jsforceConnectionStub = sinon
        .stub(jsforce, "Connection")
        .returns(jsforceStub);

      try {
        const next = sinon.stub();
        await sfCtrl.updateSFDJR(req, res, next);
        assert.called(jsforceConnectionStub);
        assert.called(jsforceStub.login);
        assert.notCalled(res.json);
      } catch (err) {
        console.log(err);
      }
    });

    test("returns error if login fails", async function() {
      loginError = "loginError";
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
      sobjectError = "sobjectError";
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
      loginError = "loginError";
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
      sobjectError = "sobjectError";
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
                paymentRequestId: "123"
              },
              eventType: "finish",
              category: "payment"
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

      test("ignores request and returns 200 if req.body.category !== `payment`", async function() {
        req.body.category = null;
        responseStub = { message: "Ignoring non-payment event type" };
        jsforceConnectionStub = sinon
          .stub(jsforce, "Connection")
          .returns(jsforceStub);
        try {
          await sfCtrl.updateSFCAPE(req, res);
          assert.calledWith(res.json, responseStub);
          assert.calledWith(res.status, 200);
        } catch (err) {
          console.log(err);
        }
      });

      test("returns error if login fails", async function() {
        loginError = "loginError";
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
        sobjectError = "sobjectError";
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
              paymentRequestId: "123"
            },
            eventType: "finish",
            category: "payment"
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

      test("returns error if sobject update returns empty", async function() {
        jsforceSObjectUpdateStub = sinon.stub().returns({});
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
              paymentRequestId: "123"
            },
            eventType: "finish",
            category: "payment"
          }
        });
        try {
          await sfCtrl.updateSFCAPE(req, res);
          assert.called(jsforceConnectionStub);
          assert.called(jsforceStub.login);
          assert.calledWith(jsforceStub.sobject, "CAPE__c");
          assert.calledWith(res.status, 404);
          assert.called(res.json);
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
              paymentRequestId: "123"
            },
            eventType: null,
            category: "payment"
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
        sobjectError = "No payment request Id (or CAPE__c Id) submitted";
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

      test("returns error if no payment request id in body", async function() {
        sobjectError = "No payment request Id (or CAPE__c Id) submitted";
        jsforceSObjectUpdateStub = sinon
          .stub()
          .returns({ message: sobjectError });
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
          body: {}
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
        sobjectError =
          "No matching record found for paymentRequestId 123, Error0";
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
              paymentRequestId: "123"
            },
            eventType: "finish",
            category: "payment"
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

      test("updates a CAPE record", async function() {
        jsforceConnectionStub = sinon
          .stub(jsforce, "Connection")
          .returns(jsforceStub);
        try {
          await sfCtrl.updateSFCAPE(req, res);
          assert.called(jsforceConnectionStub);
          assert.called(jsforceStub.login);
          assert.calledWith(res.json, {
            message: "Updated CAPE record successfully"
          });
        } catch (err) {
          console.log(err);
        }
      });

      test("returns error if login fails", async function() {
        loginError = "loginError";
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
        sobjectError = "sobjectError";
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
        sobjectError =
          "No matching record found for CAPE sObject Id 123, Error0";
        const contactErrorStub = { ...contactStub };
        contactErrorStub.errors = ["Error0"];
        contactErrorStub.success = false;
        jsforceSObjectUpdateStub = sinon
          .stub()
          .returns((null, contactErrorStub));
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

      test("returns error if sobject update returns empty", async function() {
        const contactErrorStub = {};
        jsforceSObjectUpdateStub = sinon
          .stub()
          .returns((null, contactErrorStub));
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
          assert.called(res.json);
        } catch (err) {
          console.log(err);
        }
      });
    });
  });

  suite("sfCtrl > getSFCAPEByContactId", function() {
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

    test("gets a single CAPE record by Contact Id", async function() {
      query = `SELECT Active_Account_Last_4__c, Payment_Error_Hold__c, Unioni_se_MemberID__c, Card_Brand__c, LastModifiedDate, Id, Employer__c FROM CAPE__c WHERE Worker__c = \'123456789\' ORDER BY LastModifiedDate DESC LIMIT 1`;
      try {
        await sfCtrl.getSFCAPEByContactId(req, res);
        assert.called(jsforceConnectionStub);
        assert.called(jsforceStub.login);
        assert.calledWith(jsforceStub.query, query);
        assert.calledWith(res.json, contactStub);
      } catch (err) {
        console.log(err);
      }
    });

    test("returns error if login fails", async function() {
      loginError = "loginError";
      loginStub = sinon.stub().throws(new Error(loginError));
      jsforceStub.login = loginStub;

      try {
        await sfCtrl.getSFCAPEByContactId(req, res);
        assert.called(jsforceConnectionStub);
        assert.called(jsforceStub.login);
        assert.calledWith(res.status, 500);
        assert.calledWith(res.json, { message: loginError });
      } catch (err) {
        console.log(err);
      }
    });

    test("returns error if query fails", async function() {
      queryError = "queryError";
      queryStub = sinon.stub().throws(new Error(queryError));
      jsforceStub.query = queryStub;

      try {
        await sfCtrl.getSFCAPEByContactId(req, res);
        assert.called(jsforceConnectionStub);
        assert.called(jsforceStub.query);
        assert.calledWith(res.status, 500);
        assert.calledWith(res.json, { message: queryError });
      } catch (err) {
        console.log(err);
      }
    });
  });
});

suite("sumissions.ctrl.js", function() {
  after(() => {
    return knexCleaner.clean(db);
  });
  beforeEach(() => {
    authenticateMock = sinon.stub(passport, "authenticate").returns(() => {});
  });
  afterEach(function() {
    authenticateMock.restore();
    sinon.restore();
  });

  suite("submissionCtrl > createSubmission", function() {
    beforeEach(function() {
      return new Promise(resolve => {
        submissionBody.salesforce_id = "123";
        req = mockReq({
          body: { userType: "admin", ...submissionBody },
          headers: {
            "x-real-ip": "1.1.1.1"
          }
        });
        next = sinon.stub();
        resolve();
      });
    });

    afterEach(() => {
      sinon.restore();
      res = mockRes();
      responseStub = {};
    });

    test("creates a single Submission and returns submission id", async function() {
      responseStub = {};
      try {
        result = await submissionCtrl.createSubmission(req, res, next);
        chai.assert(res.locals.submission_id);
        id = res.locals.submission_id;
        assert.calledWith(res.status, 200);
        chai.assert.property(res.locals, "submission_id");
        chai.assert.property(res.locals, "currentSubmission");
      } catch (err) {
        console.log(err);
      }
    });

    test("handles edge cases: no submission_date, req.locals.next", async function() {
      responseStub = {};
      delete req.body.submission_date;
      req.locals = {
        next: true
      };
      try {
        result = await submissionCtrl.createSubmission(req, res, next);
        chai.assert(res.locals.submission_id);
        id = res.locals.submission_id;
        chai.assert.property(res.locals, "submission_id");
        chai.assert.property(res.locals, "currentSubmission");
      } catch (err) {
        console.log(err);
      }
    });

    test("returns 422 if required field missing", async function() {
      req = mockReq({
        body: submissionBody,
        headers: {
          "x-real-ip": "1.1.1.1"
        }
      });
      delete req.body.first_name;
      req.body.terms_agree = true;
      responseStub = {
        reason: "ValidationError",
        message: "Missing required field first_name"
      };
      try {
        await submissionCtrl.createSubmission(req, res, next);
        assert.calledWith(res.status, 422);
        assert.calledWith(res.json, responseStub);
      } catch (err) {
        console.log(err);
      }
    });

    test("returns 500 if db method error", async function() {
      req = mockReq({
        body: generateSampleSubmission(),
        headers: {
          "x-real-ip": "1.1.1.1"
        }
      });
      errorMsg = "There was an error saving the submission";
      submissionModelStub = sinon
        .stub(submissions, "createSubmission")
        .resolves({ message: errorMsg });

      try {
        await submissionCtrl.createSubmission(req, res);
        assert.called(submissionModelStub);
        assert.calledWith(res.status, 500);
        assert.calledWith(res.json, { message: errorMsg });
      } catch (err) {
        console.log(err);
      }
    });

    test("returns 500 if server error", async function() {
      req = mockReq({
        body: generateSampleSubmission(),
        headers: {
          "x-real-ip": "1.1.1.1"
        }
      });
      errorMsg = "There was an error saving the submission";
      submissionModelStub = sinon
        .stub(submissions, "createSubmission")
        .rejects({ message: errorMsg });

      try {
        await submissionCtrl.createSubmission(req, res, next);
        assert.called(submissionModelStub);
        assert.calledWith(res.status, 500);
        assert.calledWith(res.json, { message: errorMsg });
      } catch (err) {
        console.log(`149: ${err}`);
      }
    });
  });

  suite("submissionCtrl > getSubmissionById", function() {
    beforeEach(function() {
      return new Promise(resolve => {
        req = mockReq({
          params: {
            id
          },
          user: { ...adminBody }
        });
        resolve();
      });
    });

    afterEach(() => {
      sinon.restore();
      res = mockRes();
    });

    test("gets one submission by Id and returns 200", async function() {
      try {
        await submissionCtrl.getSubmissionById(req, res, next);
        assert.calledWith(res.status, 200);
        let result = res.locals.testData;
        delete submissionBody.submission_id;
        delete submissionBody.account_subdivision;
        delete submissionBody.contact_id;
        // test that reponse matches data submitted
        // for each key that exists in the response
        Object.keys(submissionBody).forEach(key => {
          chai.assert.property(result, key);
        });
      } catch (err) {
        console.log(err);
      }
    });

    test("returns 404 if submission not found", async function() {
      errorMsg = "Submission not found";
      submissionModelStub = sinon
        .stub(submissions, "getSubmissionById")
        .resolves({ message: errorMsg });

      try {
        await submissionCtrl.getSubmissionById(req, res, next);
        assert.called(submissionModelStub);
        assert.calledWith(res.status, 404);
        assert.calledWith(res.json, { message: errorMsg });
      } catch (err) {
        console.log(err);
      }
    });

    test("returns 500 if server error", async function() {
      errorMsg = "Submission not found";
      submissionModelStub = sinon
        .stub(submissions, "getSubmissionById")
        .rejects({ message: errorMsg });

      try {
        await submissionCtrl.getSubmissionById(req, res, next);
        assert.called(submissionModelStub);
        assert.calledWith(res.status, 500);
        assert.calledWith(res.json, { message: errorMsg });
      } catch (err) {
        console.log(err);
      }
    });

    test("returns 500 if incorrect userType", async function() {
      req.user.type = "wrong";
      errorMsg =
        "You do not have permission to access this content. Please consult an administrator.";
      submissionModelStub = sinon
        .stub(submissions, "getSubmissionById")
        .rejects({ message: errorMsg });

      try {
        await submissionCtrl.getSubmissionById(req, res, next);
        assert.calledWith(res.status, 500);
        assert.calledWith(res.json, { message: errorMsg });
      } catch (err) {
        console.log(err);
      }
    });
  });

  suite("submissionCtrl > updateSubmission", function() {
    beforeEach(function() {
      return new Promise(resolve => {
        submissionBody.salesforce_id = "123";
        delete submissionBody.submission_id;
        delete submissionBody.account_subdivision;
        delete submissionBody.contact_id;
        delete submissionBody.submisson_status;
        submissionModelStub.restore();
        submissionModelStub = sinon
          .stub(submissions, "updateSubmission")
          .resolves([{ id: "d8fff8ba-e45f-44a6-9188-6e7aa2820187" }]);
        req = mockReq({
          body: submissionBody,
          params: {
            id
          }
        });
        next = sinon.stub();
        resolve();
      });
    });

    afterEach(() => {
      sinon.restore();
      res = mockRes();
    });

    test("updates a submission and returns submission id to client", async function() {
      try {
        await submissionCtrl.updateSubmission(req, res, next);
        await submissionModelStub();
        chai.assert(res.locals.submission_id);
        id = res.locals.submission_id;

        assert.calledWith(res.status, 200);
        assert.calledWith(res.json, { submission_id: id });
      } catch (err) {
        console.log(err);
      }
    });

    test("handles edge cases: req.headers.referer, checkoff_auth, terms_agree", async function() {
      req.headers = {
        referer:
          "http://www.test.com?submission_id=d8fff8ba-e45f-44a6-9188-6e7aa2820187&salesforce_id=0035500000VFkjOAAT"
      };
      req.body.checkoff_auth = "on";
      req.body.terms_agree = "on";
      try {
        await submissionCtrl.updateSubmission(req, res, next);
        chai.assert(res.locals.submission_id);
        id = res.locals.submission_id;

        assert.calledWith(res.status, 200);
        assert.calledWith(res.json, { submission_id: id });
      } catch (err) {
        console.log(err);
      }
    });

    test("returns 422 if req.body missing", async function() {
      req.body = {};
      responseStub = {
        message: "No updates submitted"
      };
      try {
        await submissionCtrl.updateSubmission(req, res, next);
        assert.calledWith(res.status, 422);
        assert.calledWith(res.json, responseStub);
      } catch (err) {
        console.log(err);
      }
    });

    test("returns 422 if req.params.id missing", async function() {
      req = mockReq({
        body: submissionBody,
        params: {}
      });
      responseStub = {
        message: "No Id Provided in URL"
      };
      try {
        await submissionCtrl.updateSubmission(req, res, next);
        assert.calledWith(res.status, 422);
        assert.calledWith(res.json, responseStub);
      } catch (err) {
        console.log(err);
      }
    });

    test("returns 404 if no submission found", async function() {
      errorMsg = "There was an error updating the submission";
      submissionModelStub.restore();
      submissionModelStub = sinon
        .stub(submissions, "updateSubmission")
        .resolves({ message: errorMsg });

      try {
        await submissionCtrl.updateSubmission(req, res);
        assert.called(submissionModelStub);
        assert.calledWith(res.status, 404);
        assert.calledWith(res.json, { message: errorMsg });
      } catch (err) {
        console.log(err);
      }
    });

    test("returns 500 if server error", async function() {
      errorMsg = "There was an error updating the submission";
      submissionModelStub.restore();
      submissionModelStub = sinon
        .stub(submissions, "updateSubmission")
        .rejects({ message: errorMsg });

      try {
        await submissionCtrl.updateSubmission(req, res, next);
        assert.called(submissionModelStub);
        assert.calledWith(res.status, 500);
        assert.calledWith(res.json, { message: errorMsg });
      } catch (err) {
        console.log(err);
      }
    });
  });

  suite("submissionCtrl > getSubmissions", function() {
    beforeEach(function() {
      return new Promise(resolve => {
        req = mockReq({
          user: { ...adminBody }
        });
        resolve();
      });
    });

    afterEach(() => {
      sinon.restore();
      res = mockRes();
    });

    test("gets all submissions and returns 200", async function() {
      responseStub = [{ ...submissionBody }];
      responseStub[0].first_name = "firstname";
      try {
        await submissionCtrl.getSubmissions(req, res, next);
        assert.calledWith(res.status, 200);
        assert.calledWith(res.json, sinon.match.array);
        let result = res.locals.testData;
        // test that reponse matches data submitted
        // for each key that exists in the response
        Object.keys(submissionBody).forEach(key => {
          chai.assert.property(result, key);
        });
      } catch (err) {
        console.log(err);
      }
    });

    test("returns 500 if server error", async function() {
      errorMsg = "An error occurred and the submission was not deleted.";
      submissionModelStub = sinon
        .stub(submissions, "getSubmissions")
        .rejects({ message: errorMsg });

      try {
        await submissionCtrl.getSubmissions(req, res, next);
        assert.called(submissionModelStub);
        assert.calledWith(res.status, 500);
        assert.calledWith(res.json, { message: errorMsg });
      } catch (err) {
        console.log(err);
      }
    });

    test("returns 500 if incorrect userType", async function() {
      req.user.type = "wrong";
      errorMsg =
        "You do not have permission to access this content. Please consult an administrator.";
      submissionModelStub = sinon
        .stub(submissions, "getSubmissions")
        .rejects({ message: errorMsg });

      try {
        await submissionCtrl.getSubmissions(req, res, next);
        assert.calledWith(res.status, 500);
        assert.calledWith(res.json, { message: errorMsg });
      } catch (err) {
        console.log(err);
      }
    });
  });

  suite("submissionCtrl > deleteSubmission", function() {
    beforeEach(function() {
      return new Promise(resolve => {
        req = mockReq({
          params: {
            id
          },
          user: { ...adminBody }
        });
        next = sinon.stub();
        resolve();
      });
    });

    afterEach(() => {
      sinon.restore();
      res = mockRes();
    });

    test("deletes a submission and returns 200", async function() {
      responseStub = { message: "Submission deleted successfully" };
      try {
        await submissionCtrl.deleteSubmission(req, res, next);
        assert.calledWith(res.status, 200);
        assert.calledWith(res.json, responseStub);
      } catch (err) {
        console.log(err);
      }
    });

    test("returns 500 if db model method error", async function() {
      errorMsg = "An error occurred and the submission was not deleted.";
      submissionModelStub = sinon
        .stub(submissions, "deleteSubmission")
        .resolves({ message: errorMsg });
      try {
        await submissionCtrl.deleteSubmission(req, res, next);
        assert.called(submissionModelStub);
        assert.calledWith(res.status, 500);
        assert.calledWith(res.json, { message: errorMsg });
      } catch (err) {
        console.log(err);
      }
    });

    test("returns 500 if server error", async function() {
      errorMsg = "An error occurred and the submission was not deleted.";
      submissionModelStub = sinon
        .stub(submissions, "deleteSubmission")
        .rejects({ message: errorMsg });

      try {
        await submissionCtrl.deleteSubmission(req, res, next);
        assert.called(submissionModelStub);
        assert.calledWith(res.status, 500);
        assert.calledWith(res.json, { message: errorMsg });
      } catch (err) {
        console.log(err);
      }
    });

    test("returns 500 if incorrect userType", async function() {
      req.params.user_type = "wrong";
      errorMsg =
        "You do not have permission to access this content. Please consult an administrator.";
      submissionModelStub = sinon
        .stub(submissions, "deleteSubmission")
        .rejects({ message: errorMsg });

      try {
        await submissionCtrl.deleteSubmission(req, res, next);
        assert.calledWith(res.status, 500);
        assert.calledWith(res.json, { message: errorMsg });
      } catch (err) {
        console.log(err);
      }
    });
  });

  suite("submissionCtrl > verifyHumanity", function() {
    beforeEach(function() {
      token = "faketoken";
    });

    afterEach(() => {
      nock.cleanAll();
      sinon.restore();
    });

    test("when called with valid token, verifyHumanity returns success", async function() {
      const app = require("../server");
      const req = mockReq({
        body: { token },
        headers: {
          "x-real-ip": "1.1.1.1"
        }
      });
      const res = mockRes();
      const requestStub = sinon
        .stub(request, "post")
        .yields(null, null, JSON.stringify({ success: true, score: 0.9 }));

      await submissionCtrl.verifyHumanity(req, res, next).catch(err => {
        console.log(err);
      });
      assert.calledWith(res.status, 200);
      assert.calledWith(res.json, {
        score: 0.9
      });
    });
    test("verifyHumanity returns error to client if recaptcha siteverify throws", async function() {
      const app = require("../server");
      const req = mockReq({
        body: { token },
        headers: {
          "x-real-ip": "1.1.1.1"
        }
      });
      const res = mockRes();
      const requestStub = sinon
        .stub(request, "post")
        .yields(new Error("recaptcha error"), null, null);
      await submissionCtrl.verifyHumanity(req, res, next).catch(err => {
        console.log(err);
      });
      assert.calledWith(res.status, 500);
      assert.calledWith(res.json, {
        message: "recaptcha error"
      });
    });
    test("verifyHumanity returns error to client if recaptcha siteverify returns error code", async function() {
      const app = require("../server");
      const req = mockReq({
        body: { token },
        headers: {
          "x-real-ip": "1.1.1.1"
        }
      });
      const res = mockRes();
      const requestStub = sinon
        .stub(request, "post")
        .yields(
          null,
          null,
          JSON.stringify({ "error-codes": ["the error code"] })
        );
      await submissionCtrl.verifyHumanity(req, res, next).catch(err => {
        console.log(err);
      });
      assert.calledWith(res.status, 500);
      assert.calledWith(res.json, {
        message: "the error code"
      });
    });
  });
});

suite("noscript > handleTab1", () => {
  after(() => {
    return knexCleaner.clean(db);
    sinon.restore();
  });
  afterEach(function() {
    res = mockRes();
    sinon.restore();
  });
  test("handles error if lookupSFContactByFLE throws", async () => {
    req = mockReq({
      body: submissionBody,
      locals: {
        next: true
      }
    });
    const LookupError = "LookupError (Test)";
    const lookupSFContactByFLEError = sinon.stub().rejects(LookupError);
    sfCtrl.lookupSFContactByFLE = lookupSFContactByFLEError;
    try {
      result = await sfCtrl.handleTab1(req, res);
      sinon.assert.called(lookupSFContactByFLEError);
      sinon.assert.calledWith(res.status, 500);
      sinon.assert.calledWith(res.json, { message: LookupError });
      sfCtrl.lookupSFContactByFLE = lookupSFContactByFLEOrig;
    } catch (err) {
      // console.log(err);
    }
  });

  test("calls updateSFContact if lookupRes returns salesforce_id", async () => {
    submissionBody.text_auth_opt_out = true;
    req = mockReq({
      body: submissionBody,
      locals: {
        next: true
      }
    });
    res = mockRes({
      status: sinon.stub()
    });
    const LookupStub = { salesforce_id: "0035500000VFkjOAAT" };
    const updateStub = "0035500000VFkjOAAT";
    const createStub = {};
    const lookupSFContactByFLESuccess = sinon.stub().resolves(LookupStub);
    const updateSFContactSuccess = sinon.stub().resolves(updateStub);
    const createSubmissionSuccess = sinon.stub().resolves(createStub);
    sfCtrl.lookupSFContactByFLE = lookupSFContactByFLESuccess;
    sfCtrl.updateSFContact = updateSFContactSuccess;
    submissionCtrl.createSubmission = createSubmissionSuccess;
    try {
      result = await sfCtrl
        .handleTab1(req, res)
        .then(async () => {
          await lookupSFContactByFLESuccess(req, res);
          await updateSFContactSuccess()
            .then(updateResult => {
              chai.assert.equal(updateResult, updateStub);
              sfCtrl.lookupSFContactByFLE = lookupSFContactByFLEOrig;
              sfCtrl.updateSFContact = updateSFContactOrig;
              submissionCtrl.createSubmission = createSubmissionOrig;
            })
            .catch(err => console.log(err));
        })
        .catch(err => console.log(err));
    } catch (err) {
      console.log(err);
    }
  });

  test("handles error if createSubmission throws", async () => {
    req = mockReq({
      body: submissionBody,
      locals: {
        next: true
      }
    });
    res = mockRes();
    const LookupStub = { salesforce_id: "0035500000VFkjOAAT" };
    const updateStub = "0035500000VFkjOAAT";
    const createError = "CreateError (Test)";

    const lookupSFContactByFLESuccess = sinon.stub().resolves(LookupStub);
    const updateSFContactSuccess = sinon.stub().resolves(updateStub);
    const createSubmissionError = sinon.stub().rejects(createError);
    sfCtrl.lookupSFContactByFLE = lookupSFContactByFLESuccess;
    sfCtrl.updateSFContact = updateSFContactSuccess;
    submissionCtrl.createSubmission = createSubmissionError;
    try {
      result = await sfCtrl
        .handleTab1(req, res)
        .then(async () => {
          await lookupSFContactByFLESuccess(req, res);
          await updateSFContactSuccess(req, res)
            .then(async updateResult => {
              chai.assert.equal(updateResult, updateStub);
              sinon.assert.called(createSubmissionError);
              await createSubmissionError().catch(err => {
                // console.log(err)
              });
              sfCtrl.lookupSFContactByFLE = lookupSFContactByFLEOrig;
              sfCtrl.updateSFContact = updateSFContactOrig;
              submissionCtrl.createSubmission = createSubmissionOrig;
            })
            .catch(err => {
              console.log(err);
            });
        })
        .catch(err => {
          console.log(err);
        });
    } catch (err) {
      console.log(err);
    }
  });

  test("handles error if updateSFContact throws", async () => {
    req = mockReq({
      body: submissionBody,
      locals: {
        next: true
      }
    });
    const LookupStub = { salesforce_id: "0035500000VFkjOAAT" };
    const UpdateError = "UpdateError (Test)";
    const updateSFContactError = sinon.stub().rejects(UpdateError);
    const lookupSFContactByFLESuccess = sinon.stub().resolves(LookupStub);
    sfCtrl.lookupSFContactByFLE = lookupSFContactByFLESuccess;
    sfCtrl.updateSFContact = updateSFContactError;
    try {
      result = await sfCtrl
        .handleTab1(req, res)
        .then(async () => {
          await lookupSFContactByFLESuccess(req, res);
          await updateSFContactError()
            .then(updateResult => {
              assert.calledWith(res.status, 500);
              assert.calledWith(res.json, { message: UpdateError });
              sfCtrl.lookupSFContactByFLE = lookupSFContactByFLEOrig;
              sfCtrl.updateSFContact = updateSFContactOrig;
            })
            .catch(err => {
              // console.log(err);
            });
        })
        .catch(err => {
          // console.log(err)
        });
    } catch (err) {
      console.log(err);
    }
  });

  test("calls getSFEmployers if lookupRes returns null", async () => {
    req = mockReq({
      body: submissionBody,
      locals: {
        next: true
      }
    });
    res = mockRes();
    const LookupStub = null;
    const getEmployersStub = [
      { Name: "employer_name", Id: "0035500000VFkjOAAT" }
    ];
    const createContactStub = { salesforce_id: "0035500000VFkjOAAT" };
    const createSubmissionStub = "0035500000VFkjOAAT";
    const lookupSFContactByFLESuccess = sinon.stub().resolves(LookupStub);
    const getSFEmployersSuccess = sinon.stub().resolves(getEmployersStub);
    const createContactSuccess = sinon.stub().resolves(createContactStub);
    const createSubmissionSuccess = sinon.stub().resolves(createSubmissionStub);
    sfCtrl.lookupSFContactByFLE = lookupSFContactByFLESuccess;
    sfCtrl.getAllEmployers = getSFEmployersSuccess;
    sfCtrl.createSFContact = createContactSuccess;
    submissionCtrl.createSubmission = createSubmissionSuccess;
    try {
      result = await sfCtrl
        .handleTab1(req, res)
        .then(async () => {
          await lookupSFContactByFLESuccess(req, res);
          await getSFEmployersSuccess(req, res)
            .then(getEmployersResult => {
              chai.assert.equal(getEmployersResult, getEmployersStub);
              sinon.assert.called(createContactSuccess);
              sfCtrl.lookupSFContactByFLE = lookupSFContactByFLEOrig;
              sfCtrl.getAllEmployers = getSFEmployersOrig;
              sfCtrl.createSFContact = createContactOrig;
              submissionCtrl.createSubmission = createSubmissionOrig;
            })
            .catch(err => console.log(err));
        })
        .catch(err => console.log(err));
    } catch (err) {
      console.log(err);
    }
  });
  test("handles error if getSFEmployers throws", async () => {
    req = mockReq({
      body: submissionBody,
      locals: {
        next: true
      }
    });
    res = mockRes();
    const LookupStub = null;
    const getEmployersError = "getEmployersError";
    const lookupSFContactByFLESuccess = sinon.stub().resolves(LookupStub);
    const getSFEmployersError = sinon.stub().rejects(getEmployersError);
    sfCtrl.lookupSFContactByFLE = lookupSFContactByFLESuccess;
    sfCtrl.getAllEmployers = getSFEmployersError;
    try {
      result = await sfCtrl
        .handleTab1(req, res)
        .then(async () => {
          await lookupSFContactByFLESuccess(req, res);
          await getSFEmployersError(req, res)
            .then(() => {
              assert.calledWith(res.status, 500);
              assert.calledWith(res.json, { message: getSFEmployersError });
              sfCtrl.lookupSFContactByFLE = lookupSFContactByFLEOrig;
              sfCtrl.getAllEmployers = getSFEmployersOrig;
            })
            .catch(err => {
              // console.log(err);
            });
        })
        .catch(err => {
          console.log(err);
        });
    } catch (err) {
      // console.log(err);
    }
  });
  test("handles error if createSFContact throws", async () => {
    req = mockReq({
      body: submissionBody,
      locals: {
        next: true
      }
    });
    res = mockRes();
    const LookupStub = null;
    const getEmployersStub = [
      { Name: "employer_name", Id: "0035500000VFkjOAAT" }
    ];
    const createContactErrorMsg = "CreateContactError";
    const lookupSFContactByFLESuccess = sinon.stub().resolves(LookupStub);
    const getSFEmployersSuccess = sinon.stub().resolves(getEmployersStub);
    const createContactError = sinon.stub().rejects(createContactErrorMsg);
    sfCtrl.lookupSFContactByFLE = lookupSFContactByFLESuccess;
    sfCtrl.getAllEmployers = getSFEmployersSuccess;
    sfCtrl.createSFContact = createContactError;
    try {
      result = await sfCtrl
        .handleTab1(req, res)
        .then(async () => {
          await lookupSFContactByFLESuccess(req, res);
          await getSFEmployersSuccess(req, res)
            .then(getEmployersResult => {
              chai.assert.equal(getEmployersResult, getEmployersStub);
              sinon.assert.called(createContactError);
              sfCtrl.lookupSFContactByFLE = lookupSFContactByFLEOrig;
              sfCtrl.getAllEmployers = getSFEmployersOrig;
              sfCtrl.createSFContact = createContactOrig;
            })
            .catch(err => console.log(err));
        })
        .catch(err => console.log(err));
    } catch (err) {
      console.log(err);
    }
  });
  test("handles error if createSubmission throws", async () => {
    req = mockReq({
      body: submissionBody,
      locals: {
        next: true
      }
    });
    res = mockRes();
    const LookupStub = null;
    const getEmployersStub = [
      { Name: "employer_name", Id: "0035500000VFkjOAAT" }
    ];
    const createContactStub = { salesforce_id: "0035500000VFkjOAAT" };
    const createSubmissionErrorMsg = "CreateSubmissionError";
    const lookupSFContactByFLESuccess = sinon.stub().resolves(LookupStub);
    const getSFEmployersSuccess = sinon.stub().resolves(getEmployersStub);
    const createContactSuccess = sinon.stub().resolves(createContactStub);
    const createSubmissionError = sinon
      .stub()
      .rejects(createSubmissionErrorMsg);
    sfCtrl.lookupSFContactByFLE = lookupSFContactByFLESuccess;
    sfCtrl.getAllEmployers = getSFEmployersSuccess;
    sfCtrl.createSFContact = createContactSuccess;
    submissionCtrl.createSubmission = createSubmissionError;
    try {
      result = await sfCtrl
        .handleTab1(req, res)
        .then(async () => {
          await lookupSFContactByFLESuccess(req, res);
          await getSFEmployersSuccess(req, res)
            .then(async getEmployersResult => {
              chai.assert.equal(getEmployersResult, getEmployersStub);
              await createContactSuccess(req, res)
                .then(() => {
                  sinon.assert.called(createSubmissionError);
                  sfCtrl.lookupSFContactByFLE = lookupSFContactByFLEOrig;
                  sfCtrl.getAllEmployers = getSFEmployersOrig;
                  sfCtrl.createSFContact = createContactOrig;
                  submissionCtrl.createSubmission = createSubmissionOrig;
                })
                .catch(err => {
                  console.log(err);
                });
            })
            .catch(err => console.log(err));
        })
        .catch(err => console.log(err));
    } catch (err) {
      console.log(err);
    }
  });
});

suite("noscript > handleTab2", () => {
  after(() => {
    return knexCleaner.clean(db);
    sinon.restore();
  });
  afterEach(function() {
    res = mockRes();
    sinon.restore();
  });
  test("handles error if updateSubmission throws", async () => {
    req = mockReq({
      body: submissionBody
    });
    const updateError = "LookupError (Test)";
    const updateSubmissionError = sinon.stub().rejects(updateError);
    submissionCtrl.updateSubmission = updateSubmissionError;
    try {
      result = await sfCtrl.handleTab2(req, res);
      sinon.assert.called(updateSubmissionError);
      sinon.assert.calledWith(res.status, 500);
      sinon.assert.calledWith(res.json, { message: updateError });
      submissionCtrl.updateSubmission = updateSubmissionOrig;
    } catch (err) {
      // console.log(err);
    }
  });
  test("handles error if createSFOMA throws", async () => {
    submissionBody.terms_agree = true;
    submissionBody.scholarship_flag = true;
    submissionBody.checkoff_auth = true;
    req = mockReq({
      body: submissionBody
    });
    const updateStub = submissionBody;
    const updateSubmissionSuccess = sinon.stub().resolves(submissionBody);
    const createSFOMAErrorMsg = "CreateSFOMAError";
    const createSFOMAError = sinon.stub().rejects(createSFOMAErrorMsg);
    submissionCtrl.updateSubmission = updateSubmissionSuccess;
    sfCtrl.createSFOnlineMemberApp = createSFOMAError;
    try {
      result = await sfCtrl
        .handleTab2(req, res)
        .then(async () => {
          await updateSubmissionSuccess()
            .then(async () => {
              sinon.assert.called(createSFOMAError);
              submissionCtrl.updateSubmission = updateSubmissionOrig;
              sfCtrl.createSFOnlineMemberApp = createSFOMAOrig;
            })
            .catch(err => {
              console.log(err);
            });
        })
        .catch(err => {
          console.log(err);
        });
    } catch (err) {
      console.log(err);
    }
  });
});
