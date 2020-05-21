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
  after(() => {
    sinon.restore();
  });
  test("formats date as YYYY-MM-DD for salesforce", () => {
    const result1 = formatDate("1/1/2000");
    const result2 = utils.formatSFDate("1/1/2000");
    const result3 = utils.formatSFDate("12/12/2000");
    assert.equal(result1, "2000-01-01");
    assert.equal(result2, "2000-01-01");
    assert.equal(result3, "2000-12-12");
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
