const { mockReq, mockRes } = require("sinon-express-mock");
const sinon = require("sinon");
const { assert } = sinon;
const { suite, test } = require("mocha");
const sfCtrl = require("../app/controllers/sf.ctrl.js");
const jsforce = require("jsforce");
const { upload } = require("../app/controllers/image.ctrl");
const {
  generateSFContactFieldList,
  generateSampleSubmission
} = require("../app/utils/fieldConfigs");
const fieldList = generateSFContactFieldList();

let submissionBody = generateSampleSubmission();

let loginError,
  queryError,
  sobjectError,
  responseStub,
  query,
  jsforceSObjectCreateStub,
  jsforceSObjectUpdateStub,
  queryStub,
  loginStub,
  sandbox,
  next,
  res = mockRes(),
  req = mockReq(),
  first_name = "firstname",
  last_name = "lastname",
  home_email = "fake@email.com";
contactStub = { id: "0035500000VFkjOAAT", success: true, errors: [] };

suite("sf.ctrl.js", function() {
  afterEach(function() {
    res = mockRes();
  });
  suite("sfCtrl > getSFContactById", function() {
    beforeEach(function() {
      sandbox = sinon.createSandbox();
      return new Promise(resolve => {
        req = mockReq({
          params: {
            id: "123456789"
          }
        });
        responseStub = { records: [contactStub] };
        queryStub = sandbox.stub().returns((null, responseStub));
        loginStub = sandbox.stub();
        jsforceStub = {
          login: loginStub,
          query: queryStub
        };
        jsforceConnectionStub = sandbox
          .stub(jsforce, "Connection")
          .returns(jsforceStub);
        resolve();
      });
    });

    afterEach(() => {
      sandbox.restore();
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
      loginStub = sandbox.stub().throws(new Error(loginError));
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
      queryStub = sandbox.stub().throws(new Error(queryError));
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
      sandbox = sinon.createSandbox();
      return new Promise(resolve => {
        req = mockReq({
          params: {
            id: "123456789"
          }
        });
        responseStub = { message: "Successfully deleted contact" };
        jsforceSObjectDestroyStub = sandbox.stub();
        loginStub = sandbox.stub();
        jsforceStub = {
          login: loginStub,
          sobject: sandbox.stub().returns({
            destroy: jsforceSObjectDestroyStub
          })
        };
        resolve();
      });
    });

    afterEach(() => {
      sandbox.restore();
    });

    test("deletes a single contact by Id", async function() {
      responseStub = { message: "Successfully deleted contact" };
      jsforceSObjectDestroyStub = sandbox.stub();
      loginStub = sandbox.stub();
      jsforceStub = {
        login: loginStub,
        sobject: sandbox.stub().returns({
          destroy: jsforceSObjectDestroyStub
        })
      };
      jsforceConnectionStub = sandbox
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
      loginStub = sandbox.stub().throws(new Error(loginError));
      jsforceStub.login = loginStub;
      jsforceConnectionStub = sandbox
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
      jsforceSObjectDestroyStub = sandbox
        .stub()
        .throws(new Error(sobjectError));
      jsforceStub = {
        login: loginStub,
        sobject: sandbox.stub().returns({ destroy: jsforceSObjectDestroyStub })
      };
      jsforceConnectionStub = sandbox
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
      sandbox = sinon.createSandbox();
      return new Promise(resolve => {
        req = mockReq({
          body: submissionBody
        });
        jsforceSObjectCreateStub = sandbox.stub().returns((null, contactStub));
        loginStub = sandbox.stub();
        jsforceStub = {
          login: loginStub,
          sobject: sandbox.stub().returns({
            create: jsforceSObjectCreateStub
          })
        };
        resolve();
      });
    });

    afterEach(() => {
      sandbox.restore();
    });

    test("creates a single SF contact", async function() {
      responseStub = { salesforce_id: "0035500000VFkjOAAT" };
      jsforceConnectionStub = sandbox
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
      next = sandbox.stub();
      jsforceConnectionStub = sandbox
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
      loginStub = sandbox.stub().throws(new Error(loginError));
      jsforceStub.login = loginStub;
      jsforceConnectionStub = sandbox
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
      jsforceSObjectCreateStub = sandbox.stub().throws(new Error(sobjectError));
      jsforceStub = {
        login: loginStub,
        sobject: sandbox.stub().returns({ create: jsforceSObjectCreateStub })
      };
      jsforceConnectionStub = sandbox
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
      sandbox = sinon.createSandbox();
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
        queryStub = sandbox.stub().returns((null, responseStub));
        loginStub = sandbox.stub();
        jsforceStub = {
          login: loginStub,
          query: queryStub
        };
        jsforceConnectionStub = sandbox
          .stub(jsforce, "Connection")
          .returns(jsforceStub);
        resolve();
      });
    });

    afterEach(() => {
      sandbox.restore();
    });

    test("finds a single contact by first, last, email", async function() {
      responseStub = { salesforce_id: "0035500000VFkjOAAT" };
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
      queryStub = sandbox.stub().returns({ totalSize: 0 });
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
      loginStub = sandbox.stub().throws(new Error(loginError));
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
      queryStub = sandbox.stub().throws(new Error(queryError));
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
      sandbox = sinon.createSandbox();
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
        queryStub = sandbox.stub().returns((null, responseStub));
        loginStub = sandbox.stub();
        jsforceStub = {
          login: loginStub,
          query: queryStub
        };
        jsforceConnectionStub = sandbox
          .stub(jsforce, "Connection")
          .returns(jsforceStub);
        resolve();
      });
    });

    afterEach(() => {
      sandbox.restore();
    });

    test("if id in req body, calls updateSFContact", async function() {
      let updateSFContactStub = sandbox.stub(sfCtrl, "updateSFContact");
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
      let createSFContactStub = sandbox.stub(sfCtrl, "createSFContact");
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
      queryStub = sandbox.stub().returns(contactStub);
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
      let updateSFContactStub = sandbox.stub(sfCtrl, "updateSFContact");
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
      queryStub = sandbox.stub().returns({ records: [contactStub] });
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
      loginStub = sandbox.stub().throws(new Error(loginError));
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
      queryStub = sandbox.stub().throws(new Error(queryError));
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
      sandbox = sinon.createSandbox();
      return new Promise(resolve => {
        req = mockReq({
          body: submissionBody
        });
        jsforceSObjectUpdateStub = sandbox.stub().returns((null, contactStub));
        loginStub = sandbox.stub();
        jsforceStub = {
          login: loginStub,
          sobject: sandbox.stub().returns({
            update: jsforceSObjectUpdateStub
          })
        };
        resolve();
      });
    });

    afterEach(() => {
      sandbox.restore();
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
      jsforceConnectionStub = sandbox
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
      next = sandbox.stub();
      jsforceConnectionStub = sandbox
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
      loginStub = sandbox.stub().throws(new Error(loginError));
      jsforceStub.login = loginStub;
      jsforceConnectionStub = sandbox
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
      jsforceSObjectUpdateStub = sandbox.stub().throws(new Error(sobjectError));
      jsforceStub = {
        login: loginStub,
        sobject: sandbox.stub().returns({ update: jsforceSObjectUpdateStub })
      };
      jsforceConnectionStub = sandbox
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
      sandbox = sinon.createSandbox();
      return new Promise(resolve => {
        req = mockReq();
        responseStub = [contactStub];
        queryStub = sandbox.stub().returns((null, { records: responseStub }));
        loginStub = sandbox.stub();
        jsforceStub = {
          login: loginStub,
          query: queryStub
        };
        jsforceConnectionStub = sandbox
          .stub(jsforce, "Connection")
          .returns(jsforceStub);
        resolve();
      });
    });

    afterEach(() => {
      sandbox.restore();
    });

    test("gets all Employers", async function() {
      query = `SELECT Id, Name, Sub_Division__c, Agency_Number__c FROM Account WHERE Id = '0014N00001iFKWWQA4' OR (RecordTypeId = '01261000000ksTuAAI' and Division__c IN ('Retirees', 'Public', 'Care Provider'))`;
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
      queryStub = sandbox.stub().returns(new Error(queryError), null);
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
      loginStub = sandbox.stub().throws(new Error(loginError));
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
      queryStub = sandbox.stub().throws(new Error(queryError));
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
      sandbox = sinon.createSandbox();
      return new Promise(resolve => {
        req = mockReq({
          body: submissionBody
        });
        res.locals = {
          sf_contact_id: "0035500000VFkjOAAT",
          submission_id: "0035500000VFkjOAAT"
        };
        contactStub = { id: "0035500000VFkjOAAT", success: true, errors: [] };
        jsforceSObjectCreateStub = sandbox.stub().returns((null, contactStub));
        loginStub = sandbox.stub();
        jsforceStub = {
          login: loginStub,
          sobject: sandbox.stub().returns({
            create: jsforceSObjectCreateStub
          })
        };
        resolve();
      });
    });

    afterEach(() => {
      sandbox.restore();
    });

    test("creates a SF OMA object", async function() {
      responseStub = {
        salesforce_id: "0035500000VFkjOAAT",
        submission_id: "0035500000VFkjOAAT",
        sf_OMA_id: "0035500000VFkjOAAT"
      };
      jsforceConnectionStub = sandbox
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
      loginStub = sandbox.stub().throws(new Error(loginError));
      jsforceStub.login = loginStub;
      jsforceConnectionStub = sandbox
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
      jsforceSObjectCreateStub = sandbox.stub().throws(new Error(sobjectError));
      jsforceStub = {
        login: loginStub,
        sobject: sandbox.stub().returns({ create: jsforceSObjectCreateStub })
      };
      jsforceConnectionStub = sandbox
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
      sandbox = sinon.createSandbox();
      return new Promise(resolve => {
        req = mockReq({
          params: {
            id: "123456789"
          }
        });
        responseStub = { message: "Successfully deleted contact" };
        jsforceSObjectDestroyStub = sandbox.stub();
        loginStub = sandbox.stub();
        jsforceStub = {
          login: loginStub,
          sobject: sandbox.stub().returns({
            destroy: jsforceSObjectDestroyStub
          })
        };
        resolve();
      });
    });

    afterEach(() => {
      sandbox.restore();
    });

    test("deletes an OMA by Id", async function() {
      responseStub = { message: "Successfully deleted Online Member App" };
      jsforceSObjectDestroyStub = sandbox.stub();
      loginStub = sandbox.stub();
      jsforceStub = {
        login: loginStub,
        sobject: sandbox.stub().returns({
          destroy: jsforceSObjectDestroyStub
        })
      };
      jsforceConnectionStub = sandbox
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
      loginStub = sandbox.stub().throws(new Error(loginError));
      jsforceStub.login = loginStub;
      jsforceConnectionStub = sandbox
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
      jsforceSObjectDestroyStub = sandbox
        .stub()
        .throws(new Error(sobjectError));
      jsforceStub = {
        login: loginStub,
        sobject: sandbox.stub().returns({ destroy: jsforceSObjectDestroyStub })
      };
      jsforceConnectionStub = sandbox
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
});
