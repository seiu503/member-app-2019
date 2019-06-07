// test/routes_content_spec.js
/* globals describe afterEach it beforeEach */

/* ================================= SETUP ================================= */

process.env.NODE_ENV = "testing";

const chai = require("chai");
const multer = require("multer");
const aws = require("aws-sdk-mock");
const fs = require("fs");
const { db, TABLES } = require("../app/config/knex");
const { assert } = chai;
const chaiHttp = require("chai-http");
const { suite, test } = require("mocha");
const sinon = require("sinon");
const passport = require("passport");
require("../app/config/passport")(passport);
const MulterWrapper = require("../app/utils/multer.js");
const utils = require("../app/utils");
const users = require("../db/models/users");

const name = `firstname ${utils.randomText()}`;
const email = "fakeemail@test.com";
const avatar_url = "http://example.com/avatar.png";
const google_id = "1234";
const google_token = "5678";

let id;
let id2;

/* ================================= TESTS ================================= */

chai.use(chaiHttp);
let authenticateMock;
let userStub;
let multerStub;

suite("routes : image", function() {
  // this runs once before the whole suite
  // rollback and migrate testing database
  before(() => {
    return db.migrate.rollback().then(() => {
      return db.migrate.latest();
    });
  });

  // rollback to cleanup after tests are over
  after(() => {
    return db.migrate.rollback();
  });

  // these run before and after each test
  // mock passport auth and stub returned user to test secured routes
  // mock multer to test file upload to AWS S3 bucket
  beforeEach(() => {
    authenticateMock = sinon.stub(passport, "authenticate").returns(() => {});
    const user = [{ name, email, avatar_url, google_token, google_id }];
    userStub = sinon.stub(users, "createUser").resolves(user);
    authenticateMock.yields(null, {
      id: "ac577dd6-0eb8-445c-a1f2-293bf3f9f7f4"
    });
    multerStub = sinon
      .stub(MulterWrapper, "multer")
      .returns(multer({ storage: multer.memoryStorage() }));
    // S3 deleteObject mock - return a success message
    aws.mock("S3", "deleteObject", { message: "Image deleted." });
  });

  // cleanup after each test
  afterEach(() => {
    authenticateMock.restore();
    userStub.restore();
    multerStub.restore();
    aws.restore("S3");
  });

  suite("POST /api/image/single", function() {
    const app = require("../server");
    const appRoot = process.cwd();
    test("uploads an image to AWS S3 bucket", function(done) {
      chai
        .request(app)
        .post("/api/image/single")
        .set("Content-Type", "application/x-www-form-urlencoded")
        .attach(
          "image",
          fs.readFileSync(`${appRoot}/test/assets/test.png`),
          "test.png"
        )
        .end(function(err, res) {
          assert.equal(res.status, 200);
          assert.isNull(err);
          done();
        });
    });
    test("returns an error if file is too large", function(done) {
      this.timeout(5000);
      chai
        .request(app)
        .post("/api/image/single")
        .set("Content-Type", "application/x-www-form-urlencoded")
        .attach(
          "image",
          fs.readFileSync(`${appRoot}/test/assets/test_tooBig.jpg`),
          "test_tooBig.jpg"
        )
        .end(function(err, res) {
          assert.equal(res.status, 500);
          assert.isNull(err);
          assert.property(res.body, "message");
          assert.equal(res.body.message, "File too large");
          done();
        });
    });
    test("returns an error if file is unsupported filetype", function(done) {
      this.timeout(5000);
      chai
        .request(app)
        .post("/api/image/single")
        .set("Content-Type", "application/x-www-form-urlencoded")
        .attach(
          "image",
          fs.readFileSync(`${appRoot}/test/assets/test_wrongFileType.svg`),
          "test_wrongFileType.svg"
        )
        .end(function(err, res) {
          assert.equal(res.status, 500);
          assert.isNull(err);
          assert.property(res.body, "message");
          assert.equal(
            res.body.message,
            "Error: Only jpeg, jpg, png, and gif files accepted."
          );
          done();
        });
    });
  });

  suite("DELETE /api/image/:key", function() {
    const app = require("../server");

    test("deletes image file from S3 bucket", function(done) {
      chai
        .request(app)
        .delete(`/api/image/test.png`)
        .end(function(err, res) {
          assert.equal(res.status, 200);
          assert.isNull(err);
          assert.property(res.body, "message");
          assert.equal(res.body.message, "Image deleted.");
          done();
        });
    });
  });
});
