// test/routes_content_spec.js
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
const knexCleaner = require("knex-cleaner");

const content_type = "headline";
const content_type2 = "image_url";
const content = "Join SEIU Today!";
const content2 = "http://example.com/image.png";

const updatedContentType = "body_copy";
const updatedContentType2 = "redirect_url";
const updated_content = "Here's why you should join the union";
const updated_content2 = "http://example.com/redirect";

const name = `firstname ${utils.randomText()}`;
const email = "fakeemail@test.com";
const adminType = "admin";
const avatar_url = "http://example.com/avatar.png";
const google_id = "1234";
const google_token = "5678";

let id;
let id2;

/* ================================= TESTS ================================= */

chai.use(chaiHttp);
let authenticateMock;
let userStub;

suite("routes : content", function() {
  after(() => {
    return knexCleaner.clean(db);
  });

  // these run before and after each test
  // mock passport auth and stub returned user to test secured routes
  beforeEach(() => {
    authenticateMock = sinon.stub(passport, "authenticate").returns(() => {});
    const user = [
      { name, email, avatar_url, google_id, google_token, type: adminType }
    ];
    userStub = sinon.stub(users, "createUser").resolves(user);
    authenticateMock.yields(null, {
      id: "ac577dd6-0eb8-445c-a1f2-293bf3f9f7f4",
      type: "admin",
      // id: 'ba2bd722-04ef-41bb-9411-33096c4bf082',
      //    name: 'Jordan Heffernan',
      email: "heffernanj@seiu503.org",
      //    avatar_url:
      //     'https://lh5.googleusercontent.com/-5ZqUs34OFlw/AAAAAAAAAAI/AAAAAAAAAAA/ACHi3rcIMjeSlbk53JeFZeDrN-MqkDJuXQ/photo.jpg',
      google_id: "111864084607117859693",
      google_token:
        "ya29.ImSbB5PFbBRPSROsp_-8dklBU9hAIIz5kyNVO6nR9sRAeLZPLeJB5MDPGx1X3VDkerqoimGepQnXvpxlTKplxOhFAT_2lY3rckK9HoSJyQu6vp-EHV-imU5UVqU9UunEAyorzoZc"
      //    created_at: 2019-10-11T00:46:50.090Z,
      //    updated_at: 2019-10-11T00:46:57.035Z,
    });
  });

  // cleanup after each test
  afterEach(() => {
    authenticateMock.restore();
    userStub.restore();
  });

  suite("POST /api/content/", function() {
    const app = require("../server");
    test("creates and returns new content", function(done) {
      chai
        .request(app)
        .post("/api/content/")
        .send({ content_type, content, userType: adminType })
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
        .post("/api/content/")
        .send({ username: "user" })
        .end(function(err, res) {
          assert.equal(res.status, 500);
          assert.equal(res.type, "application/json");
          assert.isNotNull(res.body.message);
          done();
        });
    });
  });

  suite("GET /api/content/admin/:id", function() {
    const app = require("../server");

    test("gets one content record by id", function(done) {
      chai
        .request(app)
        .get(`/api/content/admin/${id}`)
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
        .get("/api/content/admin/123456789")
        .end(function(err, res) {
          assert.equal(res.status, 404);
          assert.equal(res.type, "application/json");
          assert.isNotNull(res.body.message);
          done();
        });
    });
  });

  suite("GET /api/contenttype/:content_type", function() {
    const app = require("../server");

    test("gets all content records of a specific type", function(done) {
      chai
        .request(app)
        .get(`/api/contenttype/admin/headline`)
        .end(function(err, res) {
          assert.equal(res.status, 200);
          assert.isNull(err);
          assert.isArray(res.body);
          assert.property(res.body[0], "id");
          assert.property(res.body[0], "created_at");
          assert.property(res.body[0], "updated_at");
          assert.property(res.body[0], "content_type");
          assert.property(res.body[0], "content");
          done();
        });
    });

    test("returns error if content type is missing or malformed", function(done) {
      chai
        .request(app)
        .get("/api/content/admin/undefined")
        .end(function(err, res) {
          assert.equal(res.status, 404);
          assert.equal(res.type, "application/json");
          assert.isNotNull(res.body.message);
          done();
        });
    });
  });

  suite("GET /api/content", function() {
    const app = require("../server");

    test("gets all content", function(done) {
      chai
        .request(app)
        .get(`/api/content/admin`)
        .end(function(err, res) {
          assert.equal(res.status, 200);
          assert.isNull(err);
          assert.isArray(res.body);
          assert.property(res.body[0], "id");
          assert.property(res.body[0], "created_at");
          assert.property(res.body[0], "updated_at");
          assert.property(res.body[0], "content_type");
          assert.property(res.body[0], "content");
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
        .send({ updates, userType: adminType })
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
        .put("/api/content/bad")
        .send({ updates, userType: adminType })
        .end(function(err, res) {
          // console.log(res.body);
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
        .send({ updates: { name: undefined }, userType: adminType })
        .end(function(err, res) {
          assert.equal(res.status, 422);
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
        .delete(`/api/content/admin/${id}`)
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
        .delete("/api/content/admin/bad")
        .end(function(err, res) {
          assert.equal(res.status, 404);
          assert.equal(res.type, "application/json");
          assert.isNotNull(res.body.message);
          done();
        });
    });
  });
});
