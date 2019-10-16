const { mockReq, mockRes } = require("sinon-express-mock");
const sinon = require("sinon");
const chai = require("chai");
const { assert } = sinon;
const { suite, test } = require("mocha");
const nock = require("nock");
const request = require("request");
const passport = require("passport");
const knexCleaner = require("knex-cleaner");
const submCtrl = require("../app/controllers/submissions.ctrl.js");
const submissions = require("../db/models/submissions");
const {
  generateSampleSubmission,
  submissionsTableFields,
  Page2TableFields
  // generateTableDisplayFields
} = require("../app/utils/fieldConfigs");
const { db } = require("../app/config/knex");
const localIpUrl = require("local-ip-url");
require("../app/config/passport")(passport);

// generateTableDisplayFields();

let submissionBody = generateSampleSubmission();

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

  suite("submCtrl > createSubmission", function() {
    beforeEach(function() {
      return new Promise(resolve => {
        submissionBody.salesforce_id = "123";
        req = mockReq({
          body: { userType: "admin", ...submissionBody }
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
        result = await submCtrl.createSubmission(req, res, next);
        chai.assert(res.locals.submission_id);
        id = res.locals.submission_id;
        assert.calledWith(res.status, 200);
        chai.assert.property(res.locals, "submission_id");
        chai.assert.property(res.locals, "currentSubmission");
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
      dbMethodStub = sinon.stub().throws(new Error(errorMsg));
      submissionModelsStub = sinon
        .stub(submissions, "createSubmission")
        .returns(dbMethodStub);

      try {
        await submCtrl.createSubmission(req, res, next);
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
      return new Promise(resolve => {
        // console.log(`155: id = ${id}`);
        submissionBody.salesforce_id = "123";
        delete submissionBody.submission_id;
        delete submissionBody.account_subdivision;
        delete submissionBody.contact_id;
        delete submissionBody.submisson_status;
        // console.log(`submissionBody`);
        // console.log(submissionBody);
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
        await submCtrl.updateSubmission(req, res, next);
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
        // console.log(err);
      }
    });

    test("returns 500 if server error", async function() {
      errorMsg = "There was an error updating the submission";
      dbMethodStub = sinon.stub().throws(new Error(errorMsg));
      submissionModelsStub = sinon
        .stub(submissions, "updateSubmission")
        .returns(dbMethodStub);

      try {
        await submCtrl.updateSubmission(req, res, next);
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
      return new Promise(resolve => {
        req = mockReq({
          params: { user_type: "admin" }
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
      try {
        await submCtrl.getSubmissions(req, res, next);
        assert.calledWith(res.status, 200);
        assert.calledWith(res.json, sinon.match.array);
        let result = res.locals.testData;
        // test that reponse matches data submitted
        // for each key that exists in the response
        Object.keys(submissionBody).forEach(key => {
          chai.assert.property(result, key);
        });
      } catch (err) {
        // console.log(err);
      }
    });

    test("returns 500 if server error", async function() {
      errorMsg = "An error occurred and the submission was not deleted.";
      dbMethodStub = sinon.stub().throws(new Error(errorMsg));
      submissionModelsStub = sinon
        .stub(submissions, "getSubmissions")
        .returns(dbMethodStub);

      try {
        await submCtrl.getSubmissions(req, res, next);
        assert.called(submissionModelsStub);
        assert.calledWith(res.status, 500);
        assert.calledWith(res.json, { message: errorMsg });
      } catch (err) {
        // console.log(err);
      }
    });

    test("returns 500 if incorrect userType", async function() {
      req.params.user_type = "wrong";
      errorMsg =
        "You do not have permission to access this content. Please consult an administrator.";
      dbMethodStub = sinon.stub().throws(new Error(errorMsg));
      submissionModelsStub = sinon
        .stub(submissions, "getSubmissions")
        .returns(dbMethodStub);

      try {
        await submCtrl.getSubmissions(req, res, next);
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
      return new Promise(resolve => {
        req = mockReq({
          params: {
            id,
            user_type: "admin"
          }
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
        await submCtrl.getSubmissionById(req, res, next);
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
      dbMethodStub = sinon.stub().returns(new Error(errorMsg));
      submissionModelsStub = sinon
        .stub(submissions, "getSubmissionById")
        .returns(dbMethodStub);

      try {
        await submCtrl.getSubmissionById(req, res, next);
        assert.called(submissionModelsStub);
        assert.calledWith(res.status, 404);
        assert.calledWith(res.json, { message: errorMsg });
      } catch (err) {
        console.log(err);
      }
    });

    test("returns 500 if server error", async function() {
      errorMsg = "Submission not found";
      dbMethodStub = sinon.stub().throws(new Error(errorMsg));
      submissionModelsStub = sinon
        .stub(submissions, "getSubmissionById")
        .returns(dbMethodStub);

      try {
        await submCtrl.getSubmissionById(req, res, next);
        assert.called(submissionModelsStub);
        assert.calledWith(res.status, 500);
        assert.calledWith(res.json, { message: errorMsg });
      } catch (err) {
        // console.log(err);
      }
    });

    test("returns 500 if incorrect userType", async function() {
      req.params.user_type = "wrong";
      errorMsg =
        "You do not have permission to access this content. Please consult an administrator.";
      dbMethodStub = sinon.stub().throws(new Error(errorMsg));
      submissionModelsStub = sinon
        .stub(submissions, "getSubmissionById")
        .returns(dbMethodStub);

      try {
        await submCtrl.getSubmissionById(req, res, next);
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
      return new Promise(resolve => {
        req = mockReq({
          params: {
            id,
            user_type: "admin"
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
      dbMethodStub = sinon.stub().returns(errorMsg);
      submissionModelsStub = sinon
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
      dbMethodStub = sinon.stub().throws(new Error(errorMsg));
      submissionModelsStub = sinon
        .stub(submissions, "deleteSubmission")
        .returns(dbMethodStub);

      try {
        await submCtrl.deleteSubmission(req, res, next);
        assert.called(submissionModelsStub);
        assert.called(dbMethods.deleteSubmission);
        assert.calledWith(res.status, 500);
        assert.calledWith(res.json, { message: errorMsg });
      } catch (err) {
        // console.log(err);
      }
    });

    test("returns 500 if incorrect userType", async function() {
      req.params.user_type = "wrong";
      errorMsg =
        "You do not have permission to access this content. Please consult an administrator.";
      dbMethodStub = sinon.stub().throws(new Error(errorMsg));
      submissionModelsStub = sinon
        .stub(submissions, "deleteSubmission")
        .returns(dbMethodStub);

      try {
        await submCtrl.deleteSubmission(req, res, next);
        assert.called(submissionModelsStub);
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
      ip_address = localIpUrl();
    });

    afterEach(() => {
      nock.cleanAll();
      sinon.restore();
    });

    test("when called with valid token, verifyHumanity returns success", async function() {
      const app = require("../server");
      const req = mockReq({ body: { token, ip_address } });
      const res = mockRes();
      const requestStub = sinon
        .stub(request, "post")
        .yields(null, null, JSON.stringify({ success: true, score: 0.9 }));

      await submCtrl.verifyHumanity(req, res, next).catch(err => {
        console.log(err);
      });
      assert.calledWith(res.status, 200);
      assert.calledWith(res.json, {
        score: 0.9
      });
    });
    test("verifyHumanity returns error to client if recaptcha siteverify throws", async function() {
      const app = require("../server");
      const req = mockReq({ body: { token, ip_address } });
      const res = mockRes();
      const requestStub = sinon
        .stub(request, "post")
        .yields(new Error("recaptcha error"), null, null);
      await submCtrl.verifyHumanity(req, res, next).catch(err => {
        console.log(err);
      });
      assert.calledWith(res.status, 500);
      assert.calledWith(res.json, {
        message: "recaptcha error"
      });
    });
    test("verifyHumanity returns error to client if recaptcha siteverify returns error code", async function() {
      const app = require("../server");
      const req = mockReq({ body: { token, ip_address } });
      const res = mockRes();
      const requestStub = sinon
        .stub(request, "post")
        .yields(
          null,
          null,
          JSON.stringify({ "error-codes": ["the error code"] })
        );
      await submCtrl.verifyHumanity(req, res, next).catch(err => {
        console.log(err);
      });
      assert.calledWith(res.status, 500);
      assert.calledWith(res.json, {
        message: "the error code"
      });
    });
  });
});
