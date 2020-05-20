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
const utils = require("../app/utils");
const { db } = require("../app/config/knex");
require("../app/config/passport")(passport);

// generateTableDisplayFields();

let submissionBody = generateSampleSubmission();
const adminBody = {
    type: "admin"
  },
  userBody = {
    type: "view"
  };

let responseStub,
  id,
  ip_address,
  next,
  result,
  errorMsg,
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
          body: { userType: "admin", ...submissionBody },
          headers: {
            "x-real-ip": "1.1.1.1"
          }
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

    test("returns 422 if required field missing", async function() {
      req = mockReq({
        body: submissionBody,
        headers: {
          "x-real-ip": "1.1.1.1"
        }
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

    test("returns 500 if db method error", async function() {
      req = mockReq({
        body: generateSampleSubmission(),
        headers: {
          "x-real-ip": "1.1.1.1"
        }
      });
      errorMsg = "There was an error saving the submission";
      submissionModelsStub = sinon
        .stub(submissions, "createSubmission")
        .resolves({ message: errorMsg });

      try {
        await submCtrl.createSubmission(req, res);
        assert.called(submissionModelsStub);
        assert.calledWith(res.status, 500);
        assert.calledWith(res.json, { message: errorMsg });
      } catch (err) {
        console.log(err);
      }
    });

    test("returns 500 if server error", async function() {
      req = mockReq({
        body: generateSampleSubmission(),
        headers: {
          "x-real-ip": "1.1.1.1"
        }
      });
      errorMsg = "There was an error saving the submission";
      submissionModelsStub = sinon
        .stub(submissions, "createSubmission")
        .rejects({ message: errorMsg });

      try {
        await submCtrl.createSubmission(req, res, next);
        assert.called(submissionModelsStub);
        assert.calledWith(res.status, 500);
        assert.calledWith(res.json, { message: errorMsg });
      } catch (err) {
        console.log(`149: ${err}`);
      }
    });
  });

  suite("submCtrl > updateSubmission", function() {
    beforeEach(function() {
      return new Promise(resolve => {
        submissionBody.salesforce_id = "123";
        delete submissionBody.submission_id;
        delete submissionBody.account_subdivision;
        delete submissionBody.contact_id;
        delete submissionBody.submisson_status;
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
        console.log(err);
      }
    });

    test("returns 404 if no submission found", async function() {
      errorMsg = "There was an error updating the submission";
      submissionModelsStub = sinon
        .stub(submissions, "updateSubmission")
        .resolves({ message: errorMsg });

      try {
        await submCtrl.updateSubmission(req, res);
        assert.called(submissionModelsStub);
        assert.calledWith(res.status, 404);
        assert.calledWith(res.json, { message: errorMsg });
      } catch (err) {
        console.log(err);
      }
    });

    test("returns 500 if server error", async function() {
      errorMsg = "There was an error updating the submission";
      submissionModelsStub = sinon
        .stub(submissions, "updateSubmission")
        .rejects({ message: errorMsg });

      try {
        await submCtrl.updateSubmission(req, res, next);
        assert.called(submissionModelsStub);
        assert.calledWith(res.status, 500);
        assert.calledWith(res.json, { message: errorMsg });
      } catch (err) {
        console.log(err);
      }
    });
  });

  suite("submCtrl > getSubmissions", function() {
    beforeEach(function() {
      return new Promise(resolve => {
        req = mockReq({
          user: { ...adminBody }
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
        console.log(err);
      }
    });

    test("returns 500 if server error", async function() {
      errorMsg = "An error occurred and the submission was not deleted.";
      submissionModelsStub = sinon
        .stub(submissions, "getSubmissions")
        .rejects({ message: errorMsg });

      try {
        await submCtrl.getSubmissions(req, res, next);
        assert.called(submissionModelsStub);
        assert.calledWith(res.status, 500);
        assert.calledWith(res.json, { message: errorMsg });
      } catch (err) {
        console.log(err);
      }
    });

    test("returns 500 if incorrect userType", async function() {
      req.user.type = "wrong";
      errorMsg =
        "You do not have permission to access this content. Please consult an administrator.";
      submissionModelsStub = sinon
        .stub(submissions, "getSubmissions")
        .rejects({ message: errorMsg });

      try {
        await submCtrl.getSubmissions(req, res, next);
        assert.calledWith(res.status, 500);
        assert.calledWith(res.json, { message: errorMsg });
      } catch (err) {
        console.log(err);
      }
    });
  });

  suite("submCtrl > getSubmissionById", function() {
    beforeEach(function() {
      return new Promise(resolve => {
        req = mockReq({
          params: {
            id
          },
          user: { ...adminBody }
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
      submissionModelsStub = sinon
        .stub(submissions, "getSubmissionById")
        .resolves({ message: errorMsg });

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
      submissionModelsStub = sinon
        .stub(submissions, "getSubmissionById")
        .rejects({ message: errorMsg });

      try {
        await submCtrl.getSubmissionById(req, res, next);
        assert.called(submissionModelsStub);
        assert.calledWith(res.status, 500);
        assert.calledWith(res.json, { message: errorMsg });
      } catch (err) {
        console.log(err);
      }
    });

    test("returns 500 if incorrect userType", async function() {
      req.user.type = "wrong";
      errorMsg =
        "You do not have permission to access this content. Please consult an administrator.";
      submissionModelsStub = sinon
        .stub(submissions, "getSubmissionById")
        .rejects({ message: errorMsg });

      try {
        await submCtrl.getSubmissionById(req, res, next);
        assert.calledWith(res.status, 500);
        assert.calledWith(res.json, { message: errorMsg });
      } catch (err) {
        console.log(err);
      }
    });
  });

  suite("submCtrl > deleteSubmission", function() {
    beforeEach(function() {
      return new Promise(resolve => {
        req = mockReq({
          params: {
            id
          },
          user: { ...adminBody }
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
      submissionModelsStub = sinon
        .stub(submissions, "deleteSubmission")
        .resolves({ message: errorMsg });
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
      submissionModelsStub = sinon
        .stub(submissions, "deleteSubmission")
        .rejects({ message: errorMsg });

      try {
        await submCtrl.deleteSubmission(req, res, next);
        assert.called(submissionModelsStub);
        assert.calledWith(res.status, 500);
        assert.calledWith(res.json, { message: errorMsg });
      } catch (err) {
        console.log(err);
      }
    });

    test("returns 500 if incorrect userType", async function() {
      req.params.user_type = "wrong";
      errorMsg =
        "You do not have permission to access this content. Please consult an administrator.";
      submissionModelsStub = sinon
        .stub(submissions, "deleteSubmission")
        .rejects({ message: errorMsg });

      try {
        await submCtrl.deleteSubmission(req, res, next);
        assert.calledWith(res.status, 500);
        assert.calledWith(res.json, { message: errorMsg });
      } catch (err) {
        console.log(err);
      }
    });
  });

  suite("submCtrl > verifyHumanity", function() {
    beforeEach(function() {
      token = "faketoken";
    });

    afterEach(() => {
      nock.cleanAll();
      sinon.restore();
    });

    test("when called with valid token, verifyHumanity returns success", async function() {
      const app = require("../server");
      const req = mockReq({
        body: { token },
        headers: {
          "x-real-ip": "1.1.1.1"
        }
      });
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
      const req = mockReq({
        body: { token },
        headers: {
          "x-real-ip": "1.1.1.1"
        }
      });
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
      const req = mockReq({
        body: { token },
        headers: {
          "x-real-ip": "1.1.1.1"
        }
      });
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
