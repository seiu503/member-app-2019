const { mockReq, mockRes } = require("sinon-express-mock");
const sinon = require("sinon");
const proxyquire = require("proxyquire");
const { assert } = sinon;
const { suite, test } = require("mocha");
const axios = require("axios");
const knexCleaner = require("knex-cleaner");
const chaiHttp = require("chai-http");
const chai = require("chai");
const expect = chai.expect;
const passport = require("passport");
require("../app/config/passport")(passport);
chai.use(chaiHttp);

const sfCtrl = require("../app/controllers/sf.ctrl.js");
const submissionCtrl = require("../app/controllers/submissions.ctrl.js");
const submissions = require("../db/models/submissions");
const utils = require("../app/utils/index.js");
const jsforce = require("jsforce");
const {RecaptchaEnterpriseServiceClient} = require('@google-cloud/recaptcha-enterprise');
const {
  generateSFContactFieldList,
  generateSampleSubmission,
  paymentFields,
  generateCAPEValidateBackEnd
} = require("../app/utils/fieldConfigs");
const fieldList = generateSFContactFieldList();
const prefillFieldList = fieldList.filter(field => field !== "Birthdate");

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

let loginError,
  queryError,
  sobjectError,
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
  const originalLogFunction = console.log;
  let output;
  after(() => {
    return knexCleaner.clean(db);
  });
  beforeEach(function() {
    // silence console.logs during tests <= THIS DOESN'T SEEM TO WORK?
    // output = '';
    // console.log = (msg) => {
    //   output += msg + '\n';
    // };
  });
  afterEach(function() {
    res = mockRes();
    sinon.restore();
    // console.log = originalLogFunction; // undo dummy log function <= THIS DOESN'T SEEM TO WORK?
    // if (this.currentTest.state === 'failed') {
    //   console.log('FAILED TEST OUTPUT HERE: ##############');
    //   console.log(output);
    // }
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
      query = `SELECT Id, Name, Sub_Division__c, Parent.Id, Agency_Number__c FROM Account WHERE RecordTypeId = '01261000000ksTuAAI' AND Division__c IN ('Retirees', 'Public', 'Care Provider', 'Private Facilities') AND Sub_Division__c != null AND Agency_Number__c != null AND Id != '0014N00001iFKWWQA4' AND Id != '0016100000Pw3XQAAZ' AND Id != '0016100000TOfXsAAL' AND Id !='0016100000Pw3aKAAR'`;
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
        delete submissionBody.birthdate;
        delete submissionBody.Birthdate__c;
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
      delete submissionBody.birthdate;
      delete submissionBody.Birthdate__c;
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
      // token = "faketoken";
    });

    afterEach(() => {
      sinon.restore();
    });

    test("when called with valid token, verifyHumanity returns success", async function() {
      this.timeout(3000);
      const app = require("../server");
      const req = mockReq({
        body: { token },
        headers: {
          "x-real-ip": "1.1.1.1"
        }
      });
      let recaptchaResponseStub;

      token = "faketoken";
      return new Promise(resolve => {
        recaptchaResponseStub = {
            riskAnalysis: {
              score: 0.9,
              reasons: []
            },
            tokenProperties: {
              valid: true,
              action: 'homepage',
              invalidReason: '',
            }
        }
        RecaptchaEnterpriseServiceClientStub = sinon
          .stub(RecaptchaEnterpriseServiceClient.prototype, "createAssessment")
          .returns([ recaptchaResponseStub ]);
        resolve();
      });

      await submissionCtrl.verifyHumanity(req, res, next)
        .then(result => {
          console.log(`controllers_sf_submissions_spec.js > 1550`)
        })
        .catch(err => {
          console.log(`controllers_sf_submissions_spec.js > 1554`)
          console.log(err);
        });
      assert.calledWith(res.status, 200);
      assert.calledWith(res.json, {
        score: 0.9
      });

    });
    test("verifyHumanity returns error to client if recaptcha siteverify throws", async function() {
      this.timeout(3000);
      const app = require("../server");
      const req = mockReq({
        body: { token },
        headers: {
          "x-real-ip": "1.1.1.1"
        }
      });
      let recaptchaResponseStub;
      token = "faketoken";
      return new Promise(resolve => {
        recaptchaResponseStub = new Error;
        RecaptchaEnterpriseServiceClientStub = sinon
          .stub(RecaptchaEnterpriseServiceClient.prototype, "createAssessment")
          .returns([ recaptchaResponseStub ]);
        resolve();
      });
      await submissionCtrl.verifyHumanity(req, res, next).catch(err => {
        console.log(err);
      });
      assert.calledWith(res.status, 500);
      assert.calledWith(res.json, {
        message: "recaptcha error"
      });
    });
    test("verifyHumanity returns error to client if recaptcha siteverify returns error code", async function() {
      this.timeout(3000);
      const app = require("../server");
      const req = mockReq({
        body: { token },
        headers: {
          "x-real-ip": "1.1.1.1"
        }
      });
      let recaptchaResponseStub;
      token = "faketoken";
      return new Promise(resolve => {
        recaptchaResponseStub = {
            riskAnalysis: {
              score: 0.1,
              reasons: ['INVALID_REASON']
            },
            tokenProperties: {
              valid: false,
              action: 'homepage',
              invalidReason: 'INVALID_REASON_UNSPECIFIED',
            }
        }
        RecaptchaEnterpriseServiceClientStub = sinon
          .stub(RecaptchaEnterpriseServiceClient.prototype, "createAssessment")
          .returns([ recaptchaResponseStub ]);
        resolve();
      });
      assert.calledWith(res.status, 500);
      assert.calledWith(res.json, {
        message: 'INVALID_REASON_UNSPECIFIED'
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
    let lookupSFContactByFLEError = sinon
      .stub(sfCtrl, "lookupSFContactByFLE")
      .rejects(LookupError);
    let getAllEmployersSuccess = sinon
      .stub(sfCtrl, "getAllEmployers")
      .resolves([{ Name: "test", Id: "0016100000PZDmOAAX" }]);
    let createSFContactStub = sinon
      .stub(sfCtrl, "createSFContact")
      .resolves({});
    let createSubmissionStub = sinon
      .stub(submissionCtrl, "createSubmission")
      .resolves({});
    try {
      result = await sfCtrl.handleTab1(req, res);
      sinon.assert.called(lookupSFContactByFLEError);
      sinon.assert.calledWith(res.status, 500);
      sinon.assert.calledWith(res.json, { message: LookupError });
      lookupSFContactByFLEError.restore();
      getAllEmployersSuccess.restore();
      createSFContactStub.restore();
      createsSubmissionStub.restore();
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
