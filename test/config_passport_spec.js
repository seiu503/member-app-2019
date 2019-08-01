/* ================================= SETUP ================================= */

process.env.NODE_ENV = "testing";

const chai = require("chai"),
  { db } = require("../app/config/knex"),
  { assert, expect } = chai,
  { suite, test } = require("mocha"),
  sinon = require("sinon"),
  sinonChai = require("sinon-chai"),
  passport = require("passport"),
  User = require("../db/models/users"),
  { findExistingUser, saveNewUser } = require("../app/config/auth"),
  id = "325d0807-1ecf-475b-a5ab-85fea40b3f9e",
  token =
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjMyN…zE1fQ.6y9mMYVXbffHa4Q-aFUd5B3GDyyRF10iBJ28qVlEApk",
  name = `firstname lastname}`,
  email = "fakeemail@test.com",
  avatar_url = "http://example.com/avatar.png",
  profile = {
    id,
    emails: [email],
    name: {
      givenName: "firstname",
      familyName: "lastname"
    },
    picture: avatar_url
  };
chai.should();
chai.use(sinonChai);

suite("routes : passport auth", function() {
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

  suite("Passport RequireAuth", function() {
    const app = require("../server");
    test("return 422 status when no user found", function(done) {
      const authenticateMockNoUser = sinon
        .stub(passport, "authenticate")
        .returns(() => {});
      authenticateMockNoUser.yields(null, null);
      chai
        .request(app)
        .post("/api/content/")
        .send({ content_type: "headline", content: "test" })
        .end(function(err, res) {
          assert.equal(res.status, 422);
          assert.equal(
            res.body.message,
            "Sorry, you must log in to view this page."
          );
          assert.isNull(err);
          authenticateMockNoUser.restore();
          done();
        });
    });
    test("return 422 status when no error thrown", function(done) {
      const authenticateMockError = sinon
        .stub(passport, "authenticate")
        .returns(() => {});
      authenticateMockError.yields({ message: "error message" }, null);
      chai
        .request(app)
        .post("/api/content/")
        .send({ content_type: "headline", content: "test" })
        .end(function(err, res) {
          assert.equal(res.status, 422);
          assert.equal(res.body.message, "error message");
          assert.isNull(err);
          authenticateMockError.restore();
          done();
        });
    });
    test("finds existing user", function(done) {
      const getUserByGoogleIdStub = sinon
        .stub(User, "getUserByGoogleId")
        .returns(Promise.resolve({ name, email, avatar_url, id }));
      findExistingUser({ id }, token, done);
      getUserByGoogleIdStub.should.have.been.calledOnce;
      getUserByGoogleIdStub.restore();
    });
    test("saves new user", function(done) {
      const createUserStub = sinon
        .stub(User, "createUser")
        .returns(Promise.resolve({ name, email, avatar_url, id }));
      saveNewUser(profile, token, done);
      createUserStub.should.have.been.calledOnce;
      createUserStub.restore();
    });
  });
});
