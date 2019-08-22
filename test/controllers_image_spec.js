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
  sandbox,
  next,
  result,
  errorMsg,
  dbMethodStub,
  contentModelStub,
  dbMethods = {},
  authenticateMock,
  token,
  imageUrl,
  res = mockRes(),
  req = mockReq();
(appRoot = process.cwd()),
  (file = {
    name: "test.png",
    originalname: "test.png",
    type: "image/png",
    size: 5000
  });

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
    // authenticateMock = sinon.stub(passport, "authenticate").returns(() => {});
    multerStub = sinon
      .stub(MulterWrapper, "multer")
      .returns(multer({ storage: multer.memoryStorage() }));
    // // S3 deleteObject mock - return a success message
    // aws.mock("S3", "deleteObject", { message: "Image deleted." });
    // const mockedPutObject = sinon.stub();
    // aws.mock('S3', "putObject", () => {
    //   return class S3 {
    //     putObject(params, cb) {
    //       mockedPutObject(params, cb);
    //     }
    //   }
    // });
  });
  afterEach(function() {
    // authenticateMock.restore();
    // multerStub.restore();
    // aws.restore("S3");
    sandbox.restore();
  });

  suite("submCtrl > singleImgUpload", function() {
    beforeEach(function() {
      sandbox = sinon.createSandbox();
      uploadMock = sandbox.stub(imgCtrl, "upload").returns(multerStub);
      uploadMock;
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
      imageUrl = `https://${s3config.bucket}.s3-${
        s3config.region
      }.amazonaws.com/test.png`;
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
  });
});
