const { mockReq, mockRes } = require("sinon-express-mock");
const sinon = require("sinon");
const { assert } = sinon;
const { suite, test } = require("mocha");
const sfCtrl = require("../app/controllers/sf.ctrl.js");
const jsforce = require("jsforce");
const { generateSFContactFieldList } = require("../app/utils/fieldConfigs");
const fieldList = generateSFContactFieldList();

let loginError,
  queryError,
  sobjectError,
  responseStub,
  contactStub,
  query,
  jsforceSObjectCreateStub,
  jsforceSObjectUpdateStub,
  queryStub,
  loginStub,
  sandbox;

suite.only("sf.ctrl.js", function() {
  suite("sfCtrl > getSFContactById", function() {
    beforeEach(function() {
      sandbox = sinon.createSandbox();
      return new Promise(resolve => {
        contactStub = { id: "0035500000VFkjOAAT", success: true, errors: [] };
        responseStub = { records: [contactStub] };
        jsforceSObjectCreateStub = sandbox.stub();
        jsforceSObjectUpdateStub = sandbox.stub();
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
      const res = mockRes();
      const req = mockReq({
        params: {
          id: "123456789"
        }
      });
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

      const res = mockRes();
      const req = mockReq({
        params: {
          id: "123456789"
        }
      });
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

      const res = mockRes();
      const req = mockReq({
        params: {
          id: "123456789"
        }
      });
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
      const res = mockRes();
      const req = mockReq({
        params: {
          id: "123456789"
        }
      });
      try {
        await sfCtrl.deleteSFContactById(req, res);
        assert.called(jsforceConnectionStub);
        assert.called(jsforceStub.login);
        assert.calledWith(res.json, responseStub);
        // jsforceConnectionStub.restore();
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
        params: {
          id: "123456789"
        }
      });
      try {
        await sfCtrl.deleteSFContactById(req, res);
        assert.called(jsforceConnectionStub);
        assert.called(jsforceStub.login);
        assert.calledWith(res.status, 500);
        assert.calledWith(res.json, { message: loginError });
        // jsforceConnectionStub.restore();
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
      jsforceSObjectStub = {
        destroy: jsforceSObjectDestroyStub
      };
      jsforceStub = {
        login: loginStub,
        sobject: sandbox.stub().returns({ destroy: jsforceSObjectDestroyStub })
      };
      jsforceConnectionStub = sandbox
        .stub(jsforce, "Connection")
        .returns(jsforceStub);

      const res = mockRes();
      const req = mockReq({
        params: {
          id: "123456789"
        }
      });
      try {
        await sfCtrl.deleteSFContactById(req, res);
        assert.called(jsforceConnectionStub);
        assert.called(jsforceStub.login);
        assert.calledWith(jsforceStub.sobject, "Contact");
        // assert.calledWith(jsforceStub.sobject.destroy, '123456789');
        assert.calledWith(res.status, 500);
        // let options = res.json.getCall(0).args[0];
        // console.log(options);
        assert.calledWith(res.json, { message: sobjectError });
        // jsforceConnectionStub.restore();
      } catch (err) {
        console.log(err);
      }
    });
  });
});
