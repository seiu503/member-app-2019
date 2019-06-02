// test/routes_form_meta_spec.js
/* globals describe afterEach it beforeEach */

/* ================================= SETUP ================================= */

process.env.NODE_ENV = "testing";

const chai = require("chai");
const { db, TABLES } = require("../app/config/knex");
const { assert } = chai;
const chaiHttp = require("chai-http");
const { suite, test } = require("mocha");
const sinon = require("sinon");
const passport = require("passport");
require("../app/config/passport")(passport);
const utils = require("../app/utils");
const users = require("../db/models/users");

const formMetaType = "headline";
const formMetaType2 = "image_url";
const content = "Join SEIU Today!";
const content2 = "http://example.com/image.png";

const updatedFormMetaType = "body_copy";
const updatedFormMetaType2 = "redirect_url";
const updated_content = "Here's why you should join the union";
const updated_content2 = "http://example.com/redirect";

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

suite("routes : form-meta", function() {
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
  beforeEach(() => {
    authenticateMock = sinon.stub(passport, "authenticate").returns(() => {});
    const user = [{ name, email, avatar_url, google_token, google_id }];
    userStub = sinon.stub(users, "createUser").resolves(user);
    authenticateMock.yields(null, {
      id: "ac577dd6-0eb8-445c-a1f2-293bf3f9f7f4"
    });
  });

  // cleanup after each test
  afterEach(() => {
    authenticateMock.restore();
    userStub.restore();
  });

  suite("POST /api/form-meta/", function() {
    const app = require("../server");
    test("creates and returns new form meta", function(done) {
      chai
        .request(app)
        .post("/api/form-meta/")
        .send({ formMetaType, content })
        .end(function(err, res) {
          id = res.body.id;
          assert.equal(res.status, 200);
          assert.isNull(err);
          done();
        });
    });
    test("returns an error if request body is malformed", function(done) {
      chai
        .request(app)
        .post("/api/form-meta/")
        .send({ username: "user" })
        .end(function(err, res) {
          assert.equal(res.status, 500);
          assert.equal(res.type, "application/json");
          assert.isNotNull(res.body.message);
          done();
        });
    });
  });

  suite("GET /api/form-meta/:id", function() {
    const app = require("../server");

    test("gets one form meta record by id", function(done) {
      chai
        .request(app)
        .get(`/api/form-meta/${id}`)
        .end(function(err, res) {
          assert.equal(res.status, 200);
          assert.isNull(err);
          assert.property(res.body, "id");
          assert.property(res.body, "created_at");
          assert.property(res.body, "updated_at");
          assert.property(res.body, "form_meta_type");
          assert.property(res.body, "content");
          done();
        });
    });

    test("returns error if id is missing or malformed", function(done) {
      chai
        .request(app)
        .get("/api/form-meta/123456789")
        .end(function(err, res) {
          assert.equal(res.status, 404);
          assert.equal(res.type, "application/json");
          assert.isNotNull(res.body.message);
          done();
        });
    });
  });

  suite("PUT /api/form-meta/:id", function() {
    test("updates a form meta record", function(done) {
      const app = require("../server");
      const updates = {
        form_meta_type: updatedFormMetaType,
        content: updated_content
      };
      chai
        .request(app)
        .put(`/api/form-meta/${id}`)
        .send({ updates })
        .end(function(err, res) {
          assert.equal(res.status, 200);
          assert.isNull(err);
          assert.property(res.body[0], "id");
          assert.property(res.body[0], "created_at");
          assert.property(res.body[0], "updated_at");
          assert.property(res.body[0], "form_meta_type");
          assert.property(res.body[0], "content");
          done();
        });
    });
    test("returns error if id missing or malformed", function(done) {
      const app = require("../server");
      const updates = {
        form_meta_type: updatedFormMetaType,
        content: updated_content
      };
      chai
        .request(app)
        .put("/api/form-meta/123456789")
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
        .put(`/api/form-meta/${id}`)
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
        .delete(`/api/form-meta/${id}`)
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
        .delete("/api/form-meta/123456789")
        .end(function(err, res) {
          assert.equal(res.status, 404);
          assert.equal(res.type, "application/json");
          assert.isNotNull(res.body.message);
          done();
        });
    });
  });
});
