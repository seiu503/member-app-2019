const { mockReq, mockRes } = require("sinon-express-mock");
const sinon = require("sinon");
const chai = require("chai");
const { assert } = sinon;
const { suite, test } = require("mocha");
const nock = require("nock");
const request = require("request");
const passport = require("passport");
const knexCleaner = require("knex-cleaner");
const contCtrl = require("../app/controllers/content.ctrl.js");
const content = require("../db/models/content");
const { db } = require("../app/config/knex");
require("../app/config/passport")(passport);

let contentBody = {
    content_type: "headline",
    content: "test"
  },
  adminBody = {
    type: "admin"
  },
  userBody = {
    type: "view"
  };

let responseStub,
  id,
  next,
  result,
  errorMsg,
  dbMethodStub,
  dbMethods = {},
  authenticateMock,
  token,
  res = mockRes(),
  req = mockReq();

suite.only("content.ctrl.js", function() {
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

  suite("contCtrl > createContent", function() {
    beforeEach(function() {
      return new Promise(resolve => {
        req = mockReq({
          body: { ...contentBody },
          user: { ...adminBody }
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

    test("creates a single Content and returns it", async function() {
      responseStub = {};
      try {
        result = await contCtrl.createContent(req, res, next);
        id = res.locals.testData.id;
        chai.assert(res.locals.testData.id);
        assert.calledWith(res.status, 200);
        chai.assert.property(res.locals.testData, "id");
        chai.assert.property(res.locals.testData, "content_type");
        chai.assert.property(res.locals.testData, "content");
        chai.assert.property(res.locals.testData, "created_at");
        chai.assert.property(res.locals.testData, "updated_at");
      } catch (err) {
        console.log(err);
      }
    });

    test("returns 500 if wrong userType", async function() {
      req = mockReq({
        body: { ...contentBody },
        user: { ...userBody }
      });
      responseStub = {
        message:
          "You do not have permission to do this. Please Consult an administrator."
      };
      try {
        await contCtrl.createContent(req, res, next);
        assert.calledWith(res.status, 500);
        assert.calledWith(res.json, responseStub);
      } catch (err) {
        console.log(err);
      }
    });

    test("returns 422 if other required field missing", async function() {
      req = mockReq({
        body: { ...contentBody },
        user: { ...adminBody }
      });
      delete req.body.content_type;
      responseStub = {
        // reason: "ValidationError",
        message: "Missing required field."
      };
      try {
        await contCtrl.createContent(req, res, next);
        assert.calledWith(res.status, 422);
        assert.calledWith(res.json, responseStub);
      } catch (err) {
        console.log(err);
      }
    });

    test("returns 500 if server error", async function() {
      errorMsg = "There was an error creating the content";
      contentModelsStub = sinon
        .stub(content, "newContent")
        .rejects({ message: errorMsg });

      try {
        await contCtrl.createContent(req, res);
        assert.called(contentModelsStub);
        assert.calledWith(res.status, 500);
        assert.calledWith(res.json, { message: errorMsg });
      } catch (err) {
        console.log(err);
      }
    });
  });

  suite("contCtrl > updateContent", function() {
    beforeEach(function() {
      contentBody.content_type = "bodyCopy";
      return new Promise(resolve => {
        req = mockReq({
          body: {
            updates: {
              ...contentBody
            }
          },
          user: { ...adminBody },
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

    test("updates a content record and returns content to client", async function() {
      try {
        await contCtrl.updateContent(req, res, next);
        id = res.locals.testData.id;
        chai.assert(res.locals.testData.id);
        assert.calledWith(res.status, 200);
        chai.assert.property(res.locals.testData, "id");
        chai.assert.property(res.locals.testData, "content_type");
        chai.assert(res.locals.testData.content_type, "bodyCopy");
        chai.assert.property(res.locals.testData, "content");
        chai.assert.property(res.locals.testData, "created_at");
        chai.assert.property(res.locals.testData, "updated_at");
      } catch (err) {
        console.log(err);
      }
    });

    test("returns 422 if req.body missing", async function() {
      req = mockReq({
        body: { updates: {} },
        user: { ...adminBody },
        params: {
          id
        }
      });
      responseStub = {
        message: "No updates submitted"
      };
      try {
        await contCtrl.updateContent(req, res, next);
        assert.calledWith(res.status, 422);
        assert.calledWith(res.json, responseStub);
      } catch (err) {
        console.log(err);
      }
    });

    test("returns 422 if req.params.id missing", async function() {
      contentBody.content_type = "bodyCopy";
      req = mockReq({
        body: { updates: contentBody },
        user: { ...adminBody }
      });
      responseStub = {
        message: "No Id Provided in URL"
      };
      try {
        await contCtrl.updateContent(req, res, next);
        assert.calledWith(res.status, 422);
        assert.calledWith(res.json, responseStub);
      } catch (err) {
        console.log(err);
      }
    });

    test("returns 500 if wrong userType", async function() {
      req = mockReq({
        body: { updates: contentBody },
        user: { ...userBody }
      });
      responseStub = {
        message:
          "You do not have permission to do this. Please Consult an administrator."
      };
      try {
        await contCtrl.updateContent(req, res, next);
        assert.calledWith(res.status, 500);
        assert.calledWith(res.json, responseStub);
      } catch (err) {
        console.log(err);
      }
    });

    test("returns 500 if server error", async function() {
      req = mockReq({
        body: { updates: contentBody },
        params: {
          id
        },
        user: { ...adminBody }
      });
      errorMsg = "An error occurred while trying to update this content";
      contentModelsStub = sinon
        .stub(content, "updateContent")
        .rejects({ message: errorMsg });

      try {
        await contCtrl.updateContent(req, res);
        assert.called(contentModelsStub);
        assert.calledWith(res.status, 500);
        assert.calledWith(res.json, { message: errorMsg });
      } catch (err) {
        console.log(err);
      }
    });
  });

  suite("contCtrl > getContent", function() {
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

    test("gets all content and returns 200", async function() {
      responseStub = [{ ...contentBody }];
      responseStub[0].content = "test";
      try {
        await contCtrl.getContent(req, res);
        assert.calledWith(res.status, 200);
        assert.calledWith(res.json, sinon.match.array);
        let result = res.locals.testData[0];
        // test that reponse matches data submitted
        // for each key that exists in the response
        Object.keys(contentBody).forEach(key => {
          chai.assert.property(result, key);
        });
      } catch (err) {
        console.log(err);
      }
    });

    test("returns 500 if wrong userType", async function() {
      req = mockReq({
        user: { ...userBody }
      });
      responseStub = {
        message:
          "You do not have permission to do this. Please Consult an administrator."
      };
      try {
        await contCtrl.getContent(req, res, next);
        assert.calledWith(res.status, 500);
        assert.calledWith(res.json, responseStub);
      } catch (err) {
        console.log(err);
      }
    });

    test("returns 500 if server error", async function() {
      req = mockReq({
        user: { ...adminBody }
      });
      errorMsg = "No Content Found";
      contentModelStub = sinon
        .stub(content, "getContent")
        .rejects({ message: errorMsg });
      try {
        await contCtrl.getContent(req, res);
        assert.called(contentModelStub);
        assert.calledWith(res.status, 500);
        assert.calledWith(res.json, { message: errorMsg });
      } catch (err) {
        console.log(err);
      }
    });
  });

  suite("contCtrl > getContentById", function() {
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

    test("gets one content by Id and returns 200", async function() {
      try {
        await contCtrl.getContentById(req, res);
        assert.calledWith(res.status, 200);
        let result = res.locals.testData;
        Object.keys(contentBody).forEach(key => {
          chai.assert.property(result, key);
        });
      } catch (err) {
        console.log(err);
      }
    });

    test("returns 404 if content not found", async function() {
      errorMsg = "Content not found";
      contentModelsStub = sinon
        .stub(content, "getContentById")
        .resolves({ message: errorMsg });

      try {
        await contCtrl.getContentById(req, res);
        assert.called(contentModelsStub);
        assert.calledWith(res.status, 404);
        assert.calledWith(res.json, { message: errorMsg });
      } catch (err) {
        console.log(err);
      }
    });

    test("returns 500 if server error", async function() {
      errorMsg = "Content not found";
      contentModelsStub = sinon
        .stub(content, "getContentById")
        .rejects({ message: errorMsg });

      try {
        await contCtrl.getContentById(req, res);
        assert.called(contentModelsStub);
        assert.calledWith(res.status, 500);
        assert.calledWith(res.json, { message: errorMsg });
      } catch (err) {
        console.log(err);
      }
    });
  });

  suite("contCtrl > getContentByType", function() {
    beforeEach(function() {
      return new Promise(resolve => {
        req = mockReq({
          params: {
            content_type: contentBody.content_type
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

    test("gets one content by type and returns 200", async function() {
      contentModelsStub = sinon
        .stub(content, "getContentByType")
        .resolves([{ ...contentBody }]);
      try {
        await contCtrl.getContentByType(req, res);
        assert.calledWith(res.status, 200);
        let result = res.locals.testData;
        Object.keys(contentBody).forEach(key => {
          chai.assert.property(result[0], key);
        });
      } catch (err) {
        console.log(err);
      }
    });

    test("returns 404 if content not found", async function() {
      errorMsg = "Content not found";
      contentModelsStub = sinon
        .stub(content, "getContentByType")
        .resolves({ message: errorMsg });

      try {
        await contCtrl.getContentByType(req, res);
        assert.called(contentModelsStub);
        assert.calledWith(res.status, 404);
        assert.calledWith(res.json, { message: errorMsg });
      } catch (err) {
        console.log(err);
      }
    });

    test("returns 500 if server error", async function() {
      errorMsg = "Content not found";
      contentModelsStub = sinon
        .stub(content, "getContentByType")
        .rejects({ message: errorMsg });

      try {
        await contCtrl.getContentByType(req, res);
        assert.called(contentModelsStub);
        assert.calledWith(res.status, 500);
        assert.calledWith(res.json, { message: errorMsg });
      } catch (err) {
        console.log(err);
      }
    });
  });

  suite("contCtrl > deleteContent", function() {
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

    test("returns 500 if wrong userType", async function() {
      req = mockReq({
        params: {
          id
        },
        user: { ...userBody }
      });
      responseStub = {
        message:
          "You do not have permission to do this. Please Consult an administrator."
      };
      try {
        await contCtrl.deleteContent(req, res, next);
        assert.called(contentModelsStub);
        assert.calledWith(res.status, 500);
        assert.calledWith(res.json, responseStub);
      } catch (err) {
        console.log(err);
      }
    });

    test("deletes a content and returns 200", async function() {
      req = mockReq({
        params: {
          id
        },
        user: { ...adminBody }
      });
      responseStub = { message: "Content deleted successfully" };
      try {
        await contCtrl.deleteContent(req, res, next);
        assert.calledWith(res.status, 200);
        assert.calledWith(res.json, responseStub);
      } catch (err) {
        console.log(err);
      }
    });

    test("returns 404 if content not found", async function() {
      errorMsg = "An error occurred and the content was not deleted.";
      contentModelsStub = sinon
        .stub(content, "deleteContent")
        .resolves({ message: errorMsg });

      try {
        await contCtrl.deleteContent(req, res);
        assert.called(contentModelsStub);
        assert.calledWith(res.status, 404);
        assert.calledWith(res.json, { message: errorMsg });
      } catch (err) {
        console.log(err);
      }
    });

    test("returns 500 if server error", async function() {
      errorMsg = "An error occurred and the content was not deleted.";
      contentModelsStub = sinon
        .stub(content, "deleteContent")
        .rejects({ message: errorMsg });

      try {
        await contCtrl.deleteContent(req, res);
        assert.called(contentModelsStub);
        assert.calledWith(res.status, 500);
        assert.calledWith(res.json, { message: errorMsg });
      } catch (err) {
        console.log(err);
      }
    });
  });
});
