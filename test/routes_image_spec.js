// test/routes_content_spec.js
/* globals describe afterEach it beforeEach */

/* ================================= SETUP ================================= */

process.env.NODE_ENV = "testing";

const chai = require("chai");
const multer = require("multer");
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
  });

  // cleanup after each test
  afterEach(() => {
    authenticateMock.restore();
    userStub.restore();
    multerStub.restore();
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
          console.log("routes_image_spec.js > 104");
          console.log(res.message);
          assert.equal(res.status, 500);
          assert.isNotNull(res.message);
          done();
        });
    });
  });

  suite("GET /api/content/:id", function() {
    const app = require("../server");

    test("gets one content record by id", function(done) {
      chai
        .request(app)
        .get(`/api/content/${id}`)
        .end(function(err, res) {
          assert.equal(res.status, 200);
          assert.isNull(err);
          assert.property(res.body, "id");
          assert.property(res.body, "created_at");
          assert.property(res.body, "updated_at");
          assert.property(res.body, "content_type");
          assert.property(res.body, "content");
          done();
        });
    });

    test("returns error if id is missing or malformed", function(done) {
      chai
        .request(app)
        .get("/api/content/123456789")
        .end(function(err, res) {
          assert.equal(res.status, 404);
          assert.equal(res.type, "application/json");
          assert.isNotNull(res.body.message);
          done();
        });
    });
  });

  suite("PUT /api/content/:id", function() {
    test("updates a content record", function(done) {
      const app = require("../server");
      const updates = {
        content_type: updatedContentType,
        content: updated_content
      };
      chai
        .request(app)
        .put(`/api/content/${id}`)
        .send({ updates })
        .end(function(err, res) {
          assert.equal(res.status, 200);
          assert.isNull(err);
          assert.property(res.body[0], "id");
          assert.property(res.body[0], "created_at");
          assert.property(res.body[0], "updated_at");
          assert.property(res.body[0], "content_type");
          assert.property(res.body[0], "content");
          done();
        });
    });
    test("returns error if id missing or malformed", function(done) {
      const app = require("../server");
      const updates = {
        content_type: updatedContentType,
        content: updated_content
      };
      chai
        .request(app)
        .put("/api/content/123456789")
        .send({ updates })
        .end(function(err, res) {
          assert.equal(res.status, 500);
          assert.equal(res.type, "application/json");
          assert.isNotNull(res.body.message);
          done();
        });
    });
    test("returns error if updates missing or malformed", function(done) {
      const app = require("../server");
      chai
        .request(app)
        .put(`/api/content/${id}`)
        .send({ name: undefined })
        .end(function(err, res) {
          assert.equal(res.status, 404);
          assert.equal(res.type, "application/json");
          assert.isNotNull(res.body.message);
          done();
        });
    });
  });

  suite("DELETE", function() {
    test("delete a content record", function(done) {
      const app = require("../server");
      chai
        .request(app)
        .delete(`/api/content/${id}`)
        .end(function(err, res) {
          assert.equal(res.body.message, "Content deleted successfully");
          assert.isNull(err);
          done();
        });
    });
    test("returns error if id missing or malformed", function(done) {
      const app = require("../server");
      chai
        .request(app)
        .delete("/api/content/123456789")
        .end(function(err, res) {
          assert.equal(res.status, 404);
          assert.equal(res.type, "application/json");
          assert.isNotNull(res.body.message);
          done();
        });
    });
  });
});
