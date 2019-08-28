const { suite, test } = require("mocha");
const chai = require("chai");
const sinon = require("sinon");
const { mockReq, mockRes } = require("sinon-express-mock");
const { assert } = chai;
const jwt = require("jsonwebtoken");
const {
  generateSampleValidate,
  generatePage2Validate
} = require("../app/utils/fieldConfigs");
const utils = require("../app/utils/index");

suite("fieldConfig.js / utils.js", function() {
  test("generates sample validate page 1", () => {
    const result = generateSampleValidate();
    assert.notProperty(result, "cellPhone");
    assert.property(result, "mobilePhone");
  });

  test("generates sample validate page 2", () => {
    const result = generatePage2Validate();
    assert.equal(result.hireDate, "2019-11-11");
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
