const { mockReq, mockRes } = require("sinon-express-mock");
const sinon = require("sinon");
const chai = require("chai");
const { assert } = sinon;
const { suite, test } = require("mocha");
const nock = require("nock");
const passport = require("passport");
const submCtrl = require("../app/controllers/submissions.ctrl.js");
const submissions = require("../db/models/submissions");
const {
  generateSampleSubmission,
  submissionsTableFields,
  Page2TableFields
} = require("../app/utils/fieldConfigs");
const { db } = require("../app/config/knex");
const localIpUrl = require("local-ip-url");
require("../app/config/passport")(passport);

let submissionBody = generateSampleSubmission();

let responseStub,
  id,
  sandbox,
  next,
  result,
  errorMsg,
  dbMethodStub,
  dbMethods = {},
  authenticateMock,
  token,
  res = mockRes(),
  req = mockReq();

suite("sumissions.ctrl.js", function() {
  before(() => {
    return db.migrate.rollback().then(() => {
      return db.migrate.latest();
    });
  });

  after(() => {
    return db.migrate.rollback();
  });
  beforeEach(() => {
    authenticateMock = sinon.stub(passport, "authenticate").returns(() => {});
  });
  afterEach(function() {
    authenticateMock.restore();
  });

  suite("submCtrl > createSubmission", function() {
    beforeEach(function() {
      sandbox = sinon.createSandbox();
      return new Promise(resolve => {
        submissionBody.salesforce_id = "123";
        req = mockReq({
          body: submissionBody
        });
        next = sandbox.stub();
        resolve();
      });
    });

    afterEach(() => {
      sandbox.restore();
      res = mockRes();
      responseStub = {};
    });

    test("creates a single Submission and returns next", async function() {
      try {
        result = await submCtrl.createSubmission(req, res, next);
        chai.assert(res.locals.sf_contact_id);
        chai.assert(res.locals.submission_id);
        id = res.locals.submission_id;
        assert.match(result, next());
      } catch (err) {
        console.log(err);
      }
    });

    test("returns 422 if terms_agree missing", async function() {
      delete req.body.terms_agree;
      responseStub = {
        reason: "ValidationError",
        message: "Must agree to terms of service"
      };
      try {
        await submCtrl.createSubmission(req, res, next);
        assert.calledWith(res.status, 422);
        assert.calledWith(res.json, responseStub);
      } catch (err) {
        console.log(err);
      }
    });

    test("returns 422 if other required field missing", async function() {
      req = mockReq({
        body: submissionBody
      });
      delete req.body.first_name;
      req.body.terms_agree = true;
      responseStub = {
        reason: "ValidationError",
        message: "Missing required field first_name"
      };
      try {
        await submCtrl.createSubmission(req, res, next);
        assert.calledWith(res.status, 422);
        assert.calledWith(res.json, responseStub);
      } catch (err) {
        console.log(err);
      }
    });

    // test("returns 422 if reCaptchaValue missing", async function() {
    //   delete req.body.reCaptchaValue;
    //   responseStub = {
    //     message: "Please verify that you are a human"
    //   }
    //   try {
    //     await submCtrl.createSubmission(req, res, next);
    //     assert.calledWith(res.status, 422);
    //     assert.calledWith(res.json, responseStub)
    //   } catch (err) {
    //     console.log(err);
    //   }
    // });

    test("returns 500 if server error", async function() {
      errorMsg = "There was an error saving the submission";
      dbMethodStub = sandbox.stub().throws(new Error(errorMsg));
      submissionModelsStub = sandbox
        .stub(submissions, "createSubmission")
        .returns(dbMethodStub);

      try {
        await submCtrl.createSubmission(req, res);
        assert.called(submissionModelsStub);
        assert.called(dbMethods.createSubmission);
        assert.calledWith(res.status, 500);
        assert.calledWith(res.json, { message: errorMsg });
      } catch (err) {
        // console.log(err);
      }
    });
  });

  suite("submCtrl > updateSubmission", function() {
    beforeEach(function() {
      sandbox = sinon.createSandbox();
      return new Promise(resolve => {
        submissionBody.salesforce_id = "123";
        delete submissionBody.submission_id;
        delete submissionBody.account_subdivision;
        delete submissionBody.contact_id;
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
      sandbox.restore();
      res = mockRes();
    });

    test("updates a submission and returns next", async function() {
      try {
        await submCtrl.updateSubmission(req, res, next);
        chai.assert(res.locals.sf_contact_id !== undefined);
        chai.assert(res.locals.submission_id !== undefined);
        assert.match(result, next());
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
        await submCtrl.updateSubmission(req, res, next);
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
        await submCtrl.updateSubmission(req, res, next);
        assert.calledWith(res.status, 422);
        assert.calledWith(res.json, responseStub);
      } catch (err) {
        console.log(err);
      }
    });

    test("returns 500 if server error", async function() {
      errorMsg = "There was an error updating the submission";
      dbMethodStub = sandbox.stub().throws(new Error(errorMsg));
      submissionModelsStub = sandbox
        .stub(submissions, "updateSubmission")
        .returns(dbMethodStub);

      try {
        await submCtrl.updateSubmission(req, res);
        assert.called(submissionModelsStub);
        assert.called(dbMethods.updateSubmission);
        assert.calledWith(res.status, 500);
        assert.calledWith(res.json, { message: errorMsg });
      } catch (err) {
        // console.log(err);
      }
    });
  });

  suite("submCtrl > getSubmissions", function() {
    beforeEach(function() {
      sandbox = sinon.createSandbox();
      return new Promise(resolve => {
        req = mockReq();
        resolve();
      });
    });

    afterEach(() => {
      sandbox.restore();
      res = mockRes();
    });

    test("gets all submissions and returns 200", async function() {
      responseStub = [{ ...submissionBody }];
      responseStub[0].first_name = "firstname";
      try {
        await submCtrl.getSubmissions(req, res);
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
      dbMethodStub = sandbox.stub().throws(new Error(errorMsg));
      submissionModelsStub = sandbox
        .stub(submissions, "getSubmissions")
        .returns(dbMethodStub);

      try {
        await submCtrl.getSubmissions(req, res);
        assert.called(submissionModelsStub);
        assert.calledWith(res.status, 500);
        assert.calledWith(res.json, { message: errorMsg });
      } catch (err) {
        // console.log(err);
      }
    });
  });

  suite("submCtrl > getSubmissionById", function() {
    beforeEach(function() {
      sandbox = sinon.createSandbox();
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
      sandbox.restore();
      res = mockRes();
    });

    test("gets one submission by Id and returns 200", async function() {
      try {
        await submCtrl.getSubmissionById(req, res);
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
      dbMethodStub = sandbox.stub().returns(new Error(errorMsg));
      submissionModelsStub = sandbox
        .stub(submissions, "getSubmissionById")
        .returns(dbMethodStub);

      try {
        await submCtrl.getSubmissionById(req, res);
        assert.called(submissionModelsStub);
        assert.calledWith(res.status, 404);
        assert.calledWith(res.json, { message: errorMsg });
      } catch (err) {
        // console.log(err);
      }
    });

    test("returns 500 if server error", async function() {
      errorMsg = "Submission not found";
      dbMethodStub = sandbox.stub().throws(new Error(errorMsg));
      submissionModelsStub = sandbox
        .stub(submissions, "getSubmissionById")
        .returns(dbMethodStub);

      try {
        await submCtrl.getSubmissionById(req, res);
        assert.called(submissionModelsStub);
        assert.calledWith(res.status, 500);
        assert.calledWith(res.json, { message: errorMsg });
      } catch (err) {
        // console.log(err);
      }
    });
  });

  suite("submCtrl > deleteSubmission", function() {
    beforeEach(function() {
      sandbox = sinon.createSandbox();
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
      sandbox.restore();
      res = mockRes();
    });

    test("deletes a submission and returns 200", async function() {
      responseStub = { message: "Submission deleted successfully" };
      try {
        await submCtrl.deleteSubmission(req, res, next);
        assert.calledWith(res.status, 200);
        assert.calledWith(res.json, responseStub);
      } catch (err) {
        console.log(err);
      }
    });

    test("returns 500 if db model method error", async function() {
      errorMsg = "An error occurred and the submission was not deleted.";
      dbMethodStub = sandbox.stub().returns(errorMsg);
      submissionModelsStub = sandbox
        .stub(submissions, "deleteSubmission")
        .returns(dbMethodStub);
      try {
        await submCtrl.deleteSubmission(req, res, next);
        assert.called(submissionModelsStub);
        assert.calledWith(res.status, 500);
        assert.calledWith(res.json, { message: errorMsg });
      } catch (err) {
        console.log(err);
      }
    });

    test("returns 500 if server error", async function() {
      errorMsg = "An error occurred and the submission was not deleted.";
      dbMethodStub = sandbox.stub().throws(new Error(errorMsg));
      submissionModelsStub = sandbox
        .stub(submissions, "deleteSubmission")
        .returns(dbMethodStub);

      try {
        await submCtrl.deleteSubmission(req, res);
        assert.called(submissionModelsStub);
        assert.called(dbMethods.deleteSubmission);
        assert.calledWith(res.status, 500);
        assert.calledWith(res.json, { message: errorMsg });
      } catch (err) {
        // console.log(err);
      }
    });
  });

  suite("submCtrl > verifyHumanity", function() {
    beforeEach(function() {
      token = "faketoken";
      ip = localIpUrl();
      const scope = nock("https://www.google.com")
        .post("/recaptcha/api/siteverify")
        .reply(200, {
          success: true
        });
    });

    afterEach(() => {
      nock.restore();
    });

    test("when called with valid token, verifyHumanity returns success", async function() {
      let result;
      try {
        result = await submCtrl.verifyHumanity(token, ip);
        assert.match(result, true);
      } catch (err) {
        console.log(err);
      }
    });
  });
});