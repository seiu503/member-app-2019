/* ================================= SETUP ================================= */

process.env.NODE_ENV = "testing";

const chai = require("chai"),
  { db } = require("../app/config/knex"),
  { assert, expect } = chai,
  { suite, test } = require("mocha"),
  knexCleaner = require("knex-cleaner"),
  sinon = require("sinon"),
  sinonChai = require("sinon-chai"),
  passport = require("passport"),
  User = require("../db/models/users"),
  authConfig = require("../app/config/auth"),
  { findExistingUser, saveNewUser, user } = authConfig,
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
chai.use(require("chai-passport-strategy"));
let sandbox;

suite("routes : passport auth", function() {
  // cleanup after tests are over
  after(() => {
    return knexCleaner.clean(db);
  });

  beforeEach(() => {
    sandbox = sinon.createSandbox();
  });

  afterEach(() => {
    sandbox.restore();
  });

  suite("Passport and Auth config", function() {
    const app = require("../server");
    test("return 422 status when no user found", function(done) {
      const authenticateMockNoUser = sandbox
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
          sandbox.restore();
          done();
        });
    });
    test("return 422 status when no error thrown", function(done) {
      const authenticateMockError = sandbox
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
          sandbox.restore();
          done();
        });
    });
    test("finds existing user", function(done) {
      const getUserByGoogleIdStub = sandbox
        .stub(User, "getUserByGoogleId")
        .returns(Promise.resolve({ name, email, avatar_url, id }));
      findExistingUser({ id }, token, done);
      getUserByGoogleIdStub.should.have.been.calledOnce;
      sandbox.restore();
    });
    test("saves new user", function(done) {
      const createUserStub = sandbox
        .stub(User, "createUser")
        .returns(Promise.resolve({ name, email, avatar_url, id }));
      saveNewUser(profile, token, done);
      createUserStub.should.have.been.calledOnce;
      sandbox.restore();
    });
    test("deserializes user", function(done) {
      const getUserStub = sandbox
        .stub(User, "getUserById")
        .returns(Promise.resolve({ name, email, avatar_url, id }));
      user.deserialize(id, done);
      getUserStub.should.have.been.calledOnce;
      sandbox.restore();
    });
  });

  // suite("Passport strategy", function() {

  //   suite('handling a request with valid credential in header', function() {
  //     var user
  //       , info;

  //     before(function(done) {
  //       chai.passport.use(strategy)
  //         .success(function(u, i) {
  //           user = u;
  //           info = i;
  //           done();
  //         })
  //         .req(function(req) {
  //           req.headers.authorization = 'Bearer vF9dft4qmT';
  //         })
  //         .authenticate();
  //     });

  //     it('should supply user', function() {
  //       expect(user).to.be.an.object;
  //       expect(user.id).to.equal('1234');
  //     });

  //     it('should supply info', function() {
  //       expect(info).to.be.an.object;
  //       expect(info.scope).to.equal('read');
  //     });
  //   });
  // });
});
