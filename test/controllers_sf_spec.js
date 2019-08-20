const { mockReq, mockRes } = require("sinon-express-mock");
const { assert } = require("chai");
const { suite, test } = require("mocha");
const sinon = require("sinon");
const sfCtrl = require("../app/controllers/sf.ctrl.js");
const jsforce = require("jsforce");
const { generateSFContactFieldList } = require("../app/utils/fieldConfigs");
const fieldList = generateSFContactFieldList();

let getError, authError, findError, responseStub, contactStub, query;

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
      sinon.assert.called(jsforceConnectionStub);
      sinon.assert.called(jsforceStub.login);
      sinon.assert.calledWith(jsforceStub.query, query);
      sinon.assert.calledWith(res.json, contactStub);
    } catch (err) {
      console.log(err);
    }
  });
});
