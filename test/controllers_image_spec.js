const { mockReq, mockRes } = require("sinon-express-mock");
const sinon = require("sinon");
const chai = require("chai");
const { assert } = sinon;
const { suite, test } = require("mocha");
const nock = require("nock");
const multer = require("multer");
const MulterWrapper = require("../app/utils/multer.js");
// const aws = require("aws-sdk-mock");
// const awsReal = require("aws-sdk");
const fs = require("fs");
const passport = require("passport");
const imgCtrl = require("../app/controllers/image.ctrl.js");
const content = require("../db/models/content");
const { db } = require("../app/config/knex");
require("../app/config/passport")(passport);
const s3config = require("../app/config/aws");
const { upload } = require("../app/controllers/image.ctrl");

let responseStub,
  id,
  next,
  result,
  errorMsg,
  dbMethodStub,
  contentModelStub,
  dbMethods = {},
  authenticateMock,
  token,
  res = mockRes(),
  req = mockReq(),
  appRoot = process.cwd(),
  file = {
    name: "test.png",
    originalname: "test.png",
    type: "image/png",
    size: 5000
  },
  imageUrl = `https://${s3config.bucket}.s3-${
    s3config.region
  }.amazonaws.com/test.png`,
  sandbox = sinon.createSandbox();

suite.only("image.ctrl.js", function() {
  before(() => {
    return db.migrate.rollback().then(() => {
      return db.migrate.latest();
    });
  });

  after(() => {
    return db.migrate.rollback();
  });
  beforeEach(() => {
    multerStub = sandbox
      .stub(MulterWrapper, "multer")
      .returns(multer({ storage: multer.memoryStorage() }));
  });
  afterEach(function() {
    sandbox.restore();
  });

  suite("submCtrl > singleImgUpload", function() {
    beforeEach(function() {
      uploadStub = sandbox.stub(imgCtrl, "upload").returns(multerStub);
      return new Promise(resolve => {
        req = mockReq({
          file
        });
        resolve();
      });
    });

    afterEach(() => {
      sandbox.restore();
      res = mockRes();
      responseStub = {};
    });

    test("upload a single image", async function() {
      responseStub = { content_type: "image", content: imageUrl };
      contentModelStub = sandbox
        .stub(content, "newContent")
        .returns([responseStub]);
      try {
        result = await imgCtrl.singleImgUpload(req, res);
        assert.called(contentModelStub);
        assert.calledWith(res.status, 200);
        assert.calledWith(res.json, responseStub);
      } catch (err) {
        console.log(err);
      }
    });

    test("returns 500 on newContent server error", async function() {
      errorMsg = "Error";
      responseStub = { message: errorMsg };
      contentModelStub = sandbox
        .stub(content, "newContent")
        .throws(new Error(errorMsg));
      try {
        result = await imgCtrl.singleImgUpload(req, res);
        assert.called(contentModelStub);
        assert.calledWith(res.status, 500);
        assert.calledWith(res.json, responseStub);
      } catch (err) {
        console.log(err);
      }
    });

    test("upload an image to replace existing content", async function() {
      responseStub = { content_type: "image", content: imageUrl };
      contentModelStub = sandbox
        .stub(content, "updateContent")
        .returns([responseStub]);
      req.body = {
        id: "123"
      };
      try {
        result = await imgCtrl.singleImgUpload(req, res);
        assert.called(contentModelStub);
        assert.calledWith(res.status, 200);
        assert.calledWith(res.json, responseStub);
      } catch (err) {
        console.log(err);
      }
    });

    test("returns 500 on updateContent server error", async function() {
      errorMsg = "Error";
      responseStub = { message: errorMsg };
      contentModelStub = sandbox
        .stub(content, "updateContent")
        .throws(new Error(errorMsg));
      req.body = {
        id: "123"
      };
      try {
        result = await imgCtrl.singleImgUpload(req, res);
        assert.called(contentModelStub);
        assert.calledWith(res.status, 500);
        assert.calledWith(res.json, responseStub);
      } catch (err) {
        console.log(err);
      }
    });

    test("returns image url and doesn't save to postgres on signature upload", async function() {
      (responseStub = `https://${s3config.bucket}.s3-${
        s3config.region
      }.amazonaws.com/test__signature__.png`),
        (file = {
          name: "test__signature__.png",
          originalname: "test__signature__.png",
          type: "image/png",
          size: 5000
        });
      req = mockReq({
        file
      });
      const contentModelStub1 = sandbox
        .stub(content, "updateContent")
        .throws(new Error(errorMsg));
      const contentModelStub2 = sandbox
        .stub(content, "newContent")
        .throws(new Error(errorMsg));
      try {
        result = await imgCtrl.singleImgUpload(req, res);
        assert.notCalled(contentModelStub1);
        assert.notCalled(contentModelStub2);
        assert.calledWith(res.status, 200);
        assert.calledWith(res.json, responseStub);
      } catch (err) {
        console.log(err);
      }
    });

    test("returns 500 if upload error", async function() {
      errorMsg = "Error";
      responseStub = { message: errorMsg };
      uploadStub.throws(new Error(errorMsg));
      try {
        result = await imgCtrl.singleImgUpload(req, res);
        assert.notCalled(contentModelStub);
        assert.called(uploadStub);
        assert.calledWith(res.status, 500);
        assert.calledWith(res.json, responseStub);
      } catch (err) {
        // console.log(err);
      }
    });

    test("returns 500 if multer error", async function() {
      errorMsg = "Error";
      responseStub = { message: errorMsg };
      uploadStub.throws(new multer.MulterError(errorMsg));
      try {
        result = await imgCtrl.singleImgUpload(req, res);
        assert.notCalled(contentModelStub);
        assert.called(uploadStub);
        assert.calledWith(res.status, 500);
        assert.calledWith(res.json, responseStub);
      } catch (err) {
        // console.log(err);
      }
    });

    test("returns 500 if no file attached", async function() {
      errorMsg = "No file attached. Please choose a file.";
      responseStub = { message: errorMsg };
      uploadStub.restore();
      req.file = null;
      try {
        result = await imgCtrl.singleImgUpload(req, res);
        assert.notCalled(contentModelStub);
        assert.called(uploadStub);
        assert.calledWith(res.status, 500);
        assert.calledWith(res.json, responseStub);
      } catch (err) {
        // console.log(err);
      }
    });
  });
});
