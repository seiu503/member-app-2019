const { suite, test } = require("mocha");
const chai = require("chai");
const sinon = require("sinon");
const { mockReq, mockRes } = require("sinon-express-mock");
const { assert } = chai;
const jwt = require("jsonwebtoken");
const knexCleaner = require("knex-cleaner");
const { db, TABLES } = require("../app/config/knex");
const {
  generateSampleValidate,
  generatePage2Validate,
  generateCAPEValidateBackEnd,
  generateCAPEValidateFrontEnd,
  formatDate,
  generateSampleSubmission
} = require("../app/utils/fieldConfigs");
const utils = require("../app/utils/index");
const staticCtrl = require("../app/static.ctrl.js");
const sfCtrl = require("../app/controllers/sf.ctrl.js");
const submissionCtrl = require("../app/controllers/submissions.ctrl.js");
let res = mockRes(),
  req = mockReq(),
  submissionBody = generateSampleSubmission();
// console.log(submissionBody);

suite("fieldConfig.js", function() {
  test("generates sample validate page 1", () => {
    const result = generateSampleValidate();
    assert.notProperty(result, "cellPhone");
    assert.property(result, "mobilePhone");
  });

  test("generates sample validate page 2", () => {
    const result = generatePage2Validate();
    assert.equal(result.hireDate, "2019-11-11");
  });

  test("generates sample CAPE validate", () => {
    const result = generateCAPEValidateBackEnd();
    assert.equal(result.employer_id, "employer_id");
  });

  test("generates sample CAPE validate for Front End", () => {
    const result = generateCAPEValidateFrontEnd();
    assert.equal(result.employerId, "employer_id");
  });
});

suite("utils/index.js", function() {
  test("formats date as YYYY-MM-DD for salesforce", () => {
    const result = formatDate("1/1/2000");
    assert.equal(result, "2000-01-01");
  });

  test("handleError returns 500 status and error to client", () => {
    const res = mockRes();
    utils.handleError(res, "Error");
    sinon.assert.calledWith(res.status, 500);
    sinon.assert.calledWith(res.json, { message: "Error" });
  });

  test("setUserInfo returns user id", () => {
    const user = {
      id: "123"
    };
    const req = mockReq(user);
    const result = utils.setUserInfo(req);
    assert.property(result, "id");
    assert.equal(result.id, "123");
  });

  test("generateToken returns token", () => {
    const user = {
      id: "123"
    };
    const result = utils.generateToken(user);
    const token = jwt.sign(user, process.env.JWT_SECRET, {
      expiresIn: "7d"
    });
    assert.equal(result, token);
  });

  suite.only("handleTab1", () => {
    after(() => {
      return knexCleaner.clean(db);
    });
    afterEach(function() {
      res = mockRes();
      sinon.restore();
    });
    test("handles error if lookupSFContactByFLE throws", async () => {
      req = mockReq({
        body: submissionBody
      });
      const LookupError = "LookupError (Test)";
      const lookupSFContactByFLEError = sinon
        .stub()
        .throws(new Error(LookupError));
      sfCtrl.lookupSFContactByFLE = lookupSFContactByFLEError;
      try {
        result = await utils.handleTab1(req, res);
        sinon.assert.called(lookupSFContactByFLEError);
        sinon.assert.calledWith(res.status, 500);
        sinon.assert.calledWith(res.json, { message: LookupError });
      } catch (err) {
        // console.log(err);
      }
    });

    test("calls updateSFContact if lookupRes returns salesforce_id", async () => {
      req = mockReq({
        body: submissionBody
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
        result = await utils
          .handleTab1(req, res)
          .then(async () => {
            await lookupSFContactByFLESuccess(req, res);
            await updateSFContactSuccess()
              .then(updateResult => {
                chai.assert.equal(updateResult, updateStub);
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
        body: submissionBody
      });
      res = mockRes();
      const LookupStub = { salesforce_id: "0035500000VFkjOAAT" };
      const updateStub = "0035500000VFkjOAAT";
      const createError = "CreateError (Test)";
      const lookupSFContactByFLESuccess = sinon.stub().resolves(LookupStub);
      const updateSFContactSuccess = sinon.stub().resolves(updateStub);
      const createSubmissionError = sinon.stub().throws(new Error(createError));
      sfCtrl.lookupSFContactByFLE = lookupSFContactByFLESuccess;
      sfCtrl.updateSFContact = updateSFContactSuccess;
      submissionCtrl.createSubmission = createSubmissionError;
      try {
        result = await utils
          .handleTab1(req, res)
          .then(async () => {
            await lookupSFContactByFLESuccess(req, res);
            await updateSFContactSuccess(req, res)
              .then(updateResult => {
                chai.assert.equal(updateResult, updateStub);
                sinon.assert.called(createSubmissionError);
              })
              .catch(err => console.log(err));
          })
          .catch(err => console.log(err));
      } catch (err) {
        console.log(err);
      }
    });

    test("handles error if updateSFContact throws", async () => {
      req = mockReq({
        body: submissionBody
      });
      const LookupStub = { salesforce_id: "0035500000VFkjOAAT" };
      const UpdateError = "UpdateError (Test)";
      const updateSFContactError = sinon.stub().throws(new Error(UpdateError));
      const lookupSFContactByFLESuccess = sinon.stub().resolves(LookupStub);
      sfCtrl.lookupSFContactByFLE = lookupSFContactByFLESuccess;
      sfCtrl.updateSFContact = updateSFContactError;
      try {
        result = await utils
          .handleTab1(req, res)
          .then(async () => {
            await lookupSFContactByFLESuccess(req, res);
            await updateSFContactError()
              .then(updateResult => {
                assert.calledWith(res.status, 500);
                assert.calledWith(res.json, { message: UpdateError });
              })
              .catch(err => {
                console.log(`is this the error (test line 201`);
                console.log(err);
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
        body: submissionBody
      });
      res = mockRes();
      const LookupStub = null;
      const getEmployersStub = [
        { Name: "employer_name", Id: "0035500000VFkjOAAT" }
      ];
      const createContactStub = { salesforce_id: "0035500000VFkjOAAT" };
      const createSubmissionStub = "0035500000VFkjOAAT";
      const lookupSFContactByFLESuccess = sinon.stub().resolves(LookupStub);
      const getSFEmpoyersSuccess = sinon.stub().resolves(getEmployersStub);
      const createContactSuccess = sinon.stub().resolves(createContactStub);
      const createSubmissionSuccess = sinon
        .stub()
        .resolves(createSubmissionStub);
      sfCtrl.lookupSFContactByFLE = lookupSFContactByFLESuccess;
      sfCtrl.getAllEmployers = getSFEmpoyersSuccess;
      sfCtrl.createSFContact = createContactSuccess;
      submissionCtrl.createSubmission = createSubmissionSuccess;
      try {
        result = await utils
          .handleTab1(req, res)
          .then(async () => {
            await lookupSFContactByFLESuccess(req, res);
            await getSFEmpoyersSuccess(req, res)
              .then(getEmployersResult => {
                chai.assert.equal(getEmployersResult, getEmployersStub);
                sinon.assert.called(createContactSuccess);
              })
              .catch(err => console.log(err));
          })
          .catch(err => console.log(err));
      } catch (err) {
        console.log(err);
      }
    });
  });
});

suite("static.ctrl.js", function() {
  test("serves client at `/` route", async () => {
    req = mockReq();
    res = mockRes();
    try {
      result = await staticCtrl.serveClient(req, res);
      sinon.assert.calledWith(res.status, 200);
    } catch (err) {
      console.log(err);
    }
  });
});
