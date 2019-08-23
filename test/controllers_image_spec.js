const { mockReq, mockRes } = require("sinon-express-mock");
const sinon = require("sinon");
const chai = require("chai");
const { assert } = sinon;
const { suite, test } = require("mocha");
const nock = require("nock");
const multer = require("multer");
const { Uploader, checkFile } = require("../app/utils/multer.js");
const aws = require("aws-sdk");
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
  cbStub,
  next,
  result,
  uploader,
  uploadMethodStub,
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

suite("image.ctrl.js", function() {
  before(() => {
    return db.migrate.rollback().then(() => {
      return db.migrate.latest();
    });
  });

  after(() => {
    return db.migrate.rollback();
  });

  suite("submCtrl > singleImgUpload", function() {
    beforeEach(function() {
      multerStub = sandbox
        .stub(Uploader.prototype, "startUpload")
        .resolves(multer({ storage: multer.memoryStorage() }));
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

    test("returns 500 if multer error", async function() {
      errorMsg = "Error";
      responseStub = { message: errorMsg };
      multerStub.rejects(new multer.MulterError(errorMsg));
      try {
        result = await imgCtrl.singleImgUpload(req, res);
        assert.notCalled(contentModelStub);
        assert.called(multerStub);
        assert.calledWith(res.status, 500);
        assert.calledWith(res.json, responseStub);
      } catch (err) {
        // console.log(err);
      }
    });

    test("returns 500 if upload error", async function() {
      errorMsg = "Error";
      responseStub = { message: errorMsg };
      multerStub.rejects(new Error(errorMsg));
      try {
        result = await imgCtrl.singleImgUpload(req, res);
        assert.notCalled(contentModelStub);
        assert.called(multerStub);
        assert.calledWith(res.status, 500);
        assert.calledWith(res.json, responseStub);
      } catch (err) {
        // console.log(err);
      }
    });

    test("returns 500 if no file attached", async function() {
      errorMsg = "No file attached. Please choose a file.";
      responseStub = { message: errorMsg };
      req = mockReq();
      try {
        result = await imgCtrl.singleImgUpload(req, res);
        assert.notCalled(contentModelStub);
        assert.called(multerStub);
        assert.calledWith(res.status, 500);
        assert.calledWith(res.json, responseStub);
      } catch (err) {
        // console.log(err);
      }
    });

    test("uploads a single image", async function() {
      req = mockReq({
        file
      });
      responseStub = { content_type: "image", content: imageUrl };
      contentModelStub = sandbox
        .stub(content, "newContent")
        .resolves([responseStub]);
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
      req = mockReq({
        file
      });
      contentModelStub = sandbox
        .stub(content, "newContent")
        .rejects(new Error(errorMsg));
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
        .resolves([responseStub]);
      req = mockReq({
        file,
        body: {
          id: "123"
        }
      });
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
        .rejects(new Error(errorMsg));
      req = mockReq({
        file,
        body: {
          id: "123"
        }
      });
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
      (responseStub = {
        content: `https://${s3config.bucket}.s3-${
          s3config.region
        }.amazonaws.com/test__signature__.png`
      }),
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
  });

  suite("submCtrl > deleteImage", function() {
    beforeEach(function() {
      s3 = { deleteObject: sandbox.stub() };
      s3Stub = sandbox.stub(aws, "S3").returns(s3);
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

    test("deletes an image", async function() {
      responseStub = { message: "Image deleted." };
      req = mockReq({
        params: {
          key: "123"
        }
      });
      try {
        result = await imgCtrl.deleteImage(req, res);
        assert.called(s3Stub);
        assert.calledWith(res.status, 200);
        assert.calledWith(res.json, responseStub);
      } catch (err) {
        console.log(err);
      }
    });

    test("returns 500 if S3 error", async function() {
      errorMsg = "Error";
      responseStub = { message: errorMsg };
      s3 = { deleteObject: sandbox.stub().throws(new Error(errorMsg)) };
      s3Stub.returns(s3);
      try {
        result = await imgCtrl.deleteImage(req, res);
        assert.called(s3Stub);
        assert.calledWith(res.status, 500);
        assert.calledWith(res.json, responseStub);
      } catch (err) {
        // console.log(err);
      }
    });
  });

  suite("multer.js > checkFile", function() {
    beforeEach(function() {
      cbStub = sandbox.stub();
    });

    afterEach(() => {
      sandbox.restore();
    });

    test("if allowed filetype, returns true", async function() {
      file = {
        name: "test.png",
        lastModified: 1566194288671,
        size: 36212,
        mimetype: "image/png",
        originalname: "test.png"
      };
      try {
        result = await checkFile(file, cbStub);
        assert.calledWith(cbStub, null, true);
        sandbox.restore();
      } catch (err) {
        console.log(err);
      }
    });

    test("if invalid filetype, returns error message", async function() {
      errorMsg = "Error: Only jpeg, jpg, png, and gif files accepted.";
      file = {
        name: "test.svg",
        lastModified: 1566194288671,
        size: 36212,
        mimetype: "image/svg",
        originalname: "test.svg"
      };
      try {
        result = await checkFile(file, cbStub);
        assert.calledWith(cbStub, {
          message: errorMsg
        });
        sandbox.restore();
      } catch (err) {
        console.log(err);
      }
    });
  });

  suite("multer.js > startUpload", function() {
    beforeEach(function() {
      cbStub = sandbox.stub();
      uploadMethodStub = sandbox
        .stub()
        .resolves(multer({ storage: multer.memoryStorage() }));
      uploaderStub = sandbox.createStubInstance(Uploader, {
        upload: uploadMethodStub
      });
    });

    afterEach(() => {
      sandbox.restore();
    });

    test("uploads a file", async function() {
      file = {
        name: "test.png",
        lastModified: 1566194288671,
        size: 36212,
        mimetype: "image/png",
        originalname: "test.png"
      };
      req = mockReq({
        file
      });
      try {
        uploader = new Uploader();
        result = await uploader.startUpload(req, res, next);
        assert.called(uploadMethodStub);
        sandbox.restore();
      } catch (err) {
        // console.log(err);
      }
    });

    test("returns 500 if upload error", async function() {
      errorMsg = "Error: Only jpeg, jpg, png, and gif files accepted.";
      file = {
        name: "test.svg",
        lastModified: 1566194288671,
        size: 36212,
        mimetype: "image/svg",
        originalname: "test.svg"
      };
      try {
        uploader = new Uploader();
        result = await uploader.startUpload(req, res, next);
        assert.called(uploadMethodStub);
        assert.calledWith(res.status, 500);
        assert.calledWith(res.json, errorMsg);
        sandbox.restore();
      } catch (err) {
        // console.log(err);
      }
    });
  });
});
