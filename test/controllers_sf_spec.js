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
  loginStub;

suite.only("sfCtrl > getSFContactById", function() {
  beforeEach(function() {
    return new Promise(resolve => {
      contactStub = { id: "0035500000VFkjOAAT", success: true, errors: [] };
      responseStub = { records: [contactStub] };
      jsforceSObjectCreateStub = sinon.stub();
      jsforceSObjectUpdateStub = sinon.stub();
      queryStub = sinon.stub().returns((null, responseStub));
      loginStub = sinon.stub();
      jsforceStub = {
        login: loginStub,
        query: queryStub,
        sobject: sinon.stub().returns({
          create: jsforceSObjectCreateStub,
          update: jsforceSObjectUpdateStub
        })
      };
      jsforceConnectionStub = sinon
        .stub(jsforce, "Connection")
        .returns(jsforceStub);
      resolve();
    });
  });

  afterEach(() => {
    jsforceConnectionStub.restore();
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
    loginStub = sinon.stub().throws(new Error(loginError));
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
    queryStub = sinon.stub().throws(new Error(queryError));
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
