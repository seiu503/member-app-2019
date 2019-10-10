const { mockReq, mockRes } = require("sinon-express-mock");
const sinon = require("sinon");
const chai = require("chai");
const { assert } = sinon;
const { suite, test } = require("mocha");
const nock = require("nock");
const request = require("request");
const passport = require("passport");
const knexCleaner = require("knex-cleaner");
const capeCtrl = require("../app/controllers/cape.ctrl.js");
const cape = require("../db/models/cape");
const { generateCAPEValidateBackEnd } = require("../app/utils/fieldConfigs");
const { db } = require("../app/config/knex");
const localIpUrl = require("local-ip-url");
require("../app/config/passport")(passport);

let capeBody = generateCAPEValidateBackEnd();

let responseStub,
  id,
  ip_address,
  next,
  result,
  errorMsg,
  dbMethodStub,
  dbMethods = {},
  authenticateMock,
  token,
  res = mockRes(),
  req = mockReq();

suite("cape.ctrl.js", function() {
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

  suite("capeCtrl > createCAPE", function() {
    beforeEach(function() {
      return new Promise(resolve => {
        req = mockReq({
          body: generateCAPEValidateBackEnd()
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

    test("creates a single CAPE record and returns CAPE id", async function() {
      responseStub = {};
      try {
        result = await capeCtrl.createCAPE(req, res, next);
        chai.assert(res.locals.cape_id);
        id = res.locals.cape_id;
        assert.calledWith(res.status, 200);
        chai.assert.property(res.locals, "cape_id");
        chai.assert.property(res.locals, "currentCAPE");
      } catch (err) {
        console.log(err);
      }
    });

    test("returns 422 if required field missing", async function() {
      req = mockReq({
        body: capeBody
      });
      delete req.body.first_name;
      responseStub = {
        reason: "ValidationError",
        message: "Missing required field first_name"
      };
      try {
        await capeCtrl.createCAPE(req, res, next);
        assert.calledWith(res.status, 422);
        assert.calledWith(res.json, responseStub);
      } catch (err) {
        console.log(err);
      }
    });

    test("returns 500 if server error", async function() {
      errorMsg = "There was an error saving the CAPE record";
      capeModelStub = sinon.stub(cape, "createCAPE").returns(null);

      try {
        await capeCtrl.createCAPE(req, res);
        assert.called(capeModelStub);
        assert.calledWith(res.status, 500);
        assert.calledWith(res.json, { message: errorMsg });
      } catch (err) {
        console.log(err);
      }
    });
    test("returns 500 if db method fails", async function() {
      capeModelStub = sinon
        .stub(cape, "createCAPE")
        .resolves({ message: "Error" });

      try {
        await capeCtrl.createCAPE(req, res);
        assert.called(capeModelStub);
        assert.called(dbMethods.createCAPE);
        assert.calledWith(res.status, 500);
        assert.calledWith(res.json, { message: "Error" });
      } catch (err) {
        // console.log(err);
      }
    });
    test("returns 500 if db method throws", async function() {
      capeModelStub = sinon
        .stub(cape, "createCAPE")
        .rejects({ message: "Error" });

      try {
        await capeCtrl.createCAPE(req, res);
        assert.called(capeModelStub);
        assert.called(dbMethods.createCAPE);
        assert.calledWith(res.status, 500);
        assert.calledWith(res.json, { message: "Error" });
      } catch (err) {
        // console.log(err);
      }
    });
  });

  suite("capeCtrl > updateCAPE", function() {
    beforeEach(function() {
      return new Promise(resolve => {
        // console.log(`117: id = ${id}`);
        req = mockReq({
          body: capeBody,
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

    test("updates a CAPE record and returns CAPE id to client", async function() {
      try {
        await capeCtrl.updateCAPE(req, res, next);
        chai.assert(res.locals.cape_id);
        id = res.locals.cape_id;

        assert.calledWith(res.status, 200);
        assert.calledWith(res.json, { cape_id: id });
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
        await capeCtrl.updateCAPE(req, res, next);
        assert.calledWith(res.status, 422);
        assert.calledWith(res.json, responseStub);
      } catch (err) {
        console.log(err);
      }
    });

    test("returns 422 if req.params.id missing", async function() {
      req = mockReq({
        body: capeBody,
        params: {}
      });
      responseStub = {
        message: "No Id Provided in URL"
      };
      try {
        await capeCtrl.updateCAPE(req, res, next);
        assert.calledWith(res.status, 422);
        assert.calledWith(res.json, responseStub);
      } catch (err) {
        console.log(err);
      }
    });

    test("returns 500 if server error", async function() {
      errorMsg = "There was an error updating the CAPE record";
      dbMethodStub = sinon.stub().throws(new Error(errorMsg));
      capeModelStub = sinon.stub(cape, "updateCAPE").returns(dbMethodStub);

      try {
        await capeCtrl.updateCAPE(req, res);
        assert.called(capeModelStub);
        assert.called(dbMethods.updateCAPE);
        assert.calledWith(res.status, 500);
        assert.calledWith(res.json, { message: errorMsg });
      } catch (err) {
        // console.log(err);
      }
    });

    test("returns 500 if db method fails", async function() {
      capeModelStub = sinon
        .stub(cape, "updateCAPE")
        .resolves({ message: "Error" });

      try {
        await capeCtrl.updateCAPE(req, res);
        assert.called(capeModelStub);
        assert.called(dbMethods.updateCAPE);
        assert.calledWith(res.status, 500);
        assert.calledWith(res.json, { message: "Error" });
      } catch (err) {
        // console.log(err);
      }
    });

    test("returns 500 if db method throws", async function() {
      capeModelStub = sinon
        .stub(cape, "updateCAPE")
        .rejects({ message: "Error" });

      try {
        await capeCtrl.updateCAPE(req, res);
        assert.called(capeModelStub);
        assert.called(dbMethods.updateCAPE);
        assert.calledWith(res.status, 500);
        assert.calledWith(res.json, { message: "Error" });
      } catch (err) {
        // console.log(err);
      }
    });
  });

  suite("capeCtrl > getAllCAPE", function() {
    beforeEach(function() {
      return new Promise(resolve => {
        req = mockReq();
        resolve();
      });
    });

    afterEach(() => {
      sinon.restore();
      res = mockRes();
    });

    test("gets all CAPE records and returns 200", async function() {
      responseStub = [{ ...capeBody }];
      responseStub[0].first_name = "firstname";
      try {
        await capeCtrl.getAllCAPE(req, res);
        assert.calledWith(res.status, 200);
        assert.calledWith(res.json, sinon.match.array);
        let result = res.locals.testData;

        // test that reponse matches data submitted
        // for each key that exists in the response
        Object.keys(capeBody).forEach(key => {
          chai.assert.property(result, key);
        });
      } catch (err) {
        console.log(err);
      }
    });

    test("returns 500 if server error", async function() {
      errorMsg = "An error occurred while fetching CAPE records.";
      dbMethodStub = sinon.stub().throws(new Error(errorMsg));
      capeModelStub = sinon.stub(cape, "getAllCAPE").returns(dbMethodStub);

      try {
        await capeCtrl.getAllCAPE(req, res);
        assert.called(capeModelStub);
        assert.calledWith(res.status, 500);
        assert.calledWith(res.json, { message: errorMsg });
      } catch (err) {
        // console.log(err);
      }
    });

    test("returns 500 if db method fails", async function() {
      capeModelStub = sinon
        .stub(cape, "getAllCAPE")
        .resolves({ message: "Error" });

      try {
        await capeCtrl.getAllCAPE(req, res);
        assert.called(capeModelStub);
        assert.called(dbMethods.getAllCAPE);
        assert.calledWith(res.status, 500);
        assert.calledWith(res.json, { message: "Error" });
      } catch (err) {
        // console.log(err);
      }
    });

    test("returns 500 if db method throws", async function() {
      capeModelStub = sinon
        .stub(cape, "getAllCAPE")
        .rejects({ message: "Error" });

      try {
        await capeCtrl.getAllCAPE(req, res);
        assert.called(capeModelStub);
        assert.called(dbMethods.getAllCAPE);
        assert.calledWith(res.status, 500);
        assert.calledWith(res.json, { message: "Error" });
      } catch (err) {
        // console.log(err);
      }
    });
  });

  suite("capeCtrl > getCAPEById", function() {
    beforeEach(function() {
      return new Promise(resolve => {
        req = mockReq({
          params: {
            id
          }
        });
        resolve();
      });
    });

    afterEach(() => {
      sinon.restore();
      res = mockRes();
    });

    test("gets one CAPE record by Id and returns 200", async function() {
      try {
        await capeCtrl.getCAPEById(req, res);
        assert.calledWith(res.status, 200);
        let result = res.locals.testData;
        // console.log(result);

        // test that reponse matches data submitted
        // for each key that exists in the response
        Object.keys(capeBody).forEach(key => {
          chai.assert.property(result, key);
        });
      } catch (err) {
        console.log(err);
      }
    });

    test("returns 404 if CAPE record not found", async function() {
      errorMsg = "CAPE not found";
      dbMethodStub = sinon.stub().returns(new Error(errorMsg));
      capeModelStub = sinon.stub(cape, "getCAPEById").returns(dbMethodStub);

      try {
        await capeCtrl.getCAPEById(req, res);
        assert.called(capeModelStub);
        assert.calledWith(res.status, 404);
        assert.calledWith(res.json, { message: errorMsg });
      } catch (err) {
        // console.log(err);
      }
    });

    test("returns 500 if server error", async function() {
      errorMsg = "CAPE not found";
      dbMethodStub = sinon.stub().throws(new Error(errorMsg));
      capeModelStub = sinon.stub(cape, "getCAPEById").returns(dbMethodStub);

      try {
        await capeCtrl.getCAPEById(req, res);
        assert.called(capeModelStub);
        assert.calledWith(res.status, 500);
        assert.calledWith(res.json, { message: errorMsg });
      } catch (err) {
        // console.log(err);
      }
    });

    test("returns 500 if db method fails", async function() {
      capeModelStub = sinon
        .stub(cape, "getCAPEById")
        .resolves({ message: "Error" });

      try {
        await capeCtrl.getCAPEById(req, res);
        assert.called(capeModelStub);
        assert.called(dbMethods.getCAPEById);
        assert.calledWith(res.status, 500);
        assert.calledWith(res.json, { message: "Error" });
      } catch (err) {
        // console.log(err);
      }
    });

    test("returns 500 if db method throws", async function() {
      capeModelStub = sinon
        .stub(cape, "getCAPEById")
        .rejects({ message: "Error" });

      try {
        await capeCtrl.getCAPEById(req, res);
        assert.called(capeModelStub);
        assert.called(dbMethods.getCAPEById);
        assert.calledWith(res.status, 500);
        assert.calledWith(res.json, { message: "Error" });
      } catch (err) {
        // console.log(err);
      }
    });
  });

  suite("capeCtrl > getCAPEBySFId", function() {
    beforeEach(function() {
      return new Promise(resolve => {
        req = mockReq({
          params: {
            id: "12345678"
          }
        });
        resolve();
      });
    });

    afterEach(() => {
      sinon.restore();
      res = mockRes();
    });

    test("gets one CAPE record by SF Id and returns 200", async function() {
      try {
        await capeCtrl.getCAPEBySFId(req, res);
        assert.calledWith(res.status, 200);
        let result = res.locals.testData;
        // console.log(result);

        // test that reponse matches data submitted
        // for each key that exists in the response
        Object.keys(capeBody).forEach(key => {
          chai.assert.property(result, key);
        });
      } catch (err) {
        console.log(err);
      }
    });

    test("returns 404 if CAPE record not found", async function() {
      errorMsg = "CAPE record not found";
      capeModelStub = sinon
        .stub(cape, "getCAPEBySFId")
        .resolves(new Error(errorMsg));

      try {
        await capeCtrl.getCAPEBySFId(req, res);
        assert.called(capeModelStub);
        assert.calledWith(res.status, 404);
        assert.calledWith(res.json, { message: errorMsg });
      } catch (err) {
        console.log(err);
      }
    });

    test("returns 500 if server error", async function() {
      errorMsg = "CAPE record not found";
      capeModelStub = sinon
        .stub(cape, "getCAPEBySFId")
        .rejects(new Error(errorMsg));

      try {
        await capeCtrl.getCAPEBySFId(req, res);
        assert.called(capeModelStub);
        assert.calledWith(res.status, 500);
        assert.calledWith(res.json, { message: errorMsg });
      } catch (err) {
        console.log(err);
      }
    });

    test("returns 404 if db method returns no record", async function() {
      capeModelStub = sinon
        .stub(cape, "getCAPEBySFId")
        .resolves({ message: "Error" });

      try {
        await capeCtrl.getCAPEBySFId(req, res);
        assert.called(capeModelStub);
        assert.calledWith(res.status, 404);
        assert.calledWith(res.json, { message: "Error" });
      } catch (err) {
        console.log(err);
      }
    });

    test("returns 500 if db method throws", async function() {
      capeModelStub = sinon
        .stub(cape, "getCAPEBySFId")
        .rejects({ message: "Error" });

      try {
        await capeCtrl.getCAPEBySFId(req, res);
        assert.called(capeModelStub);
        assert.calledWith(res.status, 500);
        assert.calledWith(res.json, { message: "Error" });
      } catch (err) {
        console.log(err);
      }
    });
  });

  suite("capeCtrl > deleteCAPE", function() {
    beforeEach(function() {
      return new Promise(resolve => {
        req = mockReq({
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

    test("deletes a CAPE record and returns 200", async function() {
      responseStub = { message: "CAPE record deleted successfully" };
      try {
        await capeCtrl.deleteCAPE(req, res, next);
        assert.calledWith(res.status, 200);
        assert.calledWith(res.json, responseStub);
      } catch (err) {
        console.log(err);
      }
    });

    test("returns 500 if db model method error", async function() {
      errorMsg = "An error occurred and the CAPE record was not deleted.";
      dbMethodStub = sinon.stub().returns(errorMsg);
      capeModelStub = sinon.stub(cape, "deleteCAPE").returns(dbMethodStub);
      try {
        await capeCtrl.deleteCAPE(req, res, next);
        assert.called(capeModelStub);
        assert.calledWith(res.status, 500);
        assert.calledWith(res.json, { message: errorMsg });
      } catch (err) {
        console.log(err);
      }
    });

    test("returns 500 if server error", async function() {
      errorMsg = "An error occurred and the CAPE record was not deleted.";
      dbMethodStub = sinon.stub().throws(new Error(errorMsg));
      capeModelStub = sinon.stub(cape, "deleteCAPE").returns(dbMethodStub);

      try {
        await capeCtrl.deleteCAPE(req, res);
        assert.called(capeModelStub);
        assert.called(dbMethods.deleteCAPE);
        assert.calledWith(res.status, 500);
        assert.calledWith(res.json, { message: errorMsg });
      } catch (err) {
        // console.log(err);
      }
    });

    test("returns 500 if db method fails", async function() {
      capeModelStub = sinon
        .stub(cape, "deleteCAPE")
        .resolves({ message: "Error" });

      try {
        await capeCtrl.deleteCAPE(req, res);
        assert.called(capeModelStub);
        assert.called(dbMethods.deleteCAPE);
        assert.calledWith(res.status, 500);
        assert.calledWith(res.json, { message: "Error" });
      } catch (err) {
        // console.log(err);
      }
    });

    test("returns 500 if db method throws", async function() {
      capeModelStub = sinon
        .stub(cape, "deleteCAPE")
        .rejects({ message: "Error" });

      try {
        await capeCtrl.deleteCAPE(req, res);
        assert.called(capeModelStub);
        assert.called(dbMethods.deleteCAPE);
        assert.calledWith(res.status, 500);
        assert.calledWith(res.json, { message: "Error" });
      } catch (err) {
        // console.log(err);
      }
    });
  });
});
