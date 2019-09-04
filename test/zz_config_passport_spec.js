/* ================================= SETUP ================================= */

process.env.NODE_ENV = "testing";

const chai = require("chai"),
  { db } = require("../app/config/knex"),
  { mockReq, mockRes } = require("sinon-express-mock"),
  { assert, expect, use, should, request } = chai,
  { suite, test } = require("mocha"),
  knexCleaner = require("knex-cleaner"),
  sinon = require("sinon"),
  nock = require("nock"),
  sinonChai = require("sinon-chai"),
  passport = require("passport"),
  User = require("../db/models/users"),
  authConfig = require("../app/config/auth"),
  {
    findExistingUser,
    saveNewUser,
    user,
    googleLogin,
    googleStrategy,
    jwtStrategy,
    jwtLogin
  } = authConfig,
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
  },
  returnedUser = {
    id,
    name: "firstname lastname",
    email,
    avatar_url,
    google_id: "1234",
    google_token: "5678",
    created_at: new Date(),
    updated_at: new Date()
  };
chai.should();
chai.use(sinonChai);
chai.use(require("chai-passport-strategy"));
let sandbox;

suite("routes : passport auth", function() {
  before(() => {
    nock("https://accounts.google.com")
      .filteringPath(() => "/")
      .get("/")
      .reply(200, "connected to google");
    return knexCleaner.clean(db);
  });
  after(() => {
    nock.cleanAll();
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
      findExistingUser({ id }, token, done).then(() => {
        getUserByGoogleIdStub.should.have.been.calledOnce;
        sandbox.restore();
      });
    });
    test("saves new user", function(done) {
      const createUserStub = sandbox
        .stub(User, "createUser")
        .returns(Promise.resolve({ name, email, avatar_url, id }));
      saveNewUser(profile, token, done).then(() => {
        createUserStub.should.have.been.calledOnce;
        sandbox.restore();
        return knexCleaner.clean(db);
      });
    });
    test("deserializes user", function(done) {
      const getUserStub = sandbox
        .stub(User, "getUserById")
        .returns(Promise.resolve({ name, email, avatar_url, id }));
      user.deserialize(id, done).then(() => {
        getUserStub.should.have.been.calledOnce;
        sandbox.restore();
      });
    });
  });

  suite("passport strategy", () => {
    const app = require("../server");
    test("should test for Strategies", done => {
      expect(googleStrategy).to.be.an("object");
      expect(jwtStrategy).to.be.an("object");
      done();
    });
    test("should be a function", done => {
      expect(findExistingUser).to.be.a("function");
      expect(saveNewUser).to.be.a("function");
      done();
    });

    test("should call google route", async () => {
      const response = await chai.request(app).get("/api/auth/google");
      expect(response).to.have.status(200);
      expect(response.text).to.be.deep.equal("connected to google");
    });

    suite("googleLogin", async () => {
      const sandbox = sinon.createSandbox();
      const accessToken = "";
      const refreshToken = "";
      const profile = {
        id,
        emails: [email],
        name: {
          givenName: "firstname",
          familyName: "lastname"
        },
        picture: avatar_url
      };
      const done = sandbox.stub().returnsArg(1);
      test("googleLogin returns user if user in req", async () => {
        const req = mockReq({
          user: profile
        });

        googleLogin(req, accessToken, refreshToken, profile, done)
          .then(result => {
            expect(done).to.have.been.calledWith(null, profile);
            expect(result).to.deep.equal(profile);
          })
          .catch(err => {
            console.log("164");
            console.log(err);
          })
          .finally(() => {
            sandbox.restore();
            return knexCleaner.clean(db);
          });
      });
      test("googleLogin calls createUser if no user in req", async () => {
        const req = mockReq();
        const createUserStub = sandbox
          .stub(User, "createUser")
          .resolves(profile);
        const saveNewUserStub = sandbox
          .stub(authConfig, "saveNewUser")
          .resolves(() => {});
        googleLogin(req, accessToken, refreshToken, profile, done)
          .then(() => {
            return saveNewUserStub()
              .then(() => {
                expect(createUserStub).to.have.been.calledOnce;
              })
              .catch(err => {
                // console.log('182');
                // console.log(err)
              });
          })
          .catch(err => {
            console.log("187");
            console.log(err);
          })
          .finally(() => {
            sandbox.restore();
            return knexCleaner.clean(db);
          });
      });
    });

    suite("jwtLogin", async () => {
      const sandbox = sinon.createSandbox();
      const accessToken = "";
      const refreshToken = "";
      const done = sinon.stub().returnsArg(1);
      test(
        "jwtLogin returns user if user in req",
        sinon.test(async () => {
          const req = mockReq({
            user: profile
          });

          const getUserByIdStub = this.stub(User, "getUserById").resolves(
            returnedUsers
          );

          jwtLogin(req, profile, done)
            .then(() => {
              expect(getUserByIdStub).to.have.been.calledWith(id);
            })
            .catch(err => {
              console.log("219");
              console.log(err);
            })
            .finally(() => {
              sandbox.restore();
              return knexCleaner.clean(db);
            });
        })
      );
      test(
        "jwtLogin handles error if no user found",
        sinon.test(async () => {
          const req = mockReq();
          const getUserByIdStub = this.stub(User, "getUserById").rejects(
            new Error("test error")
          );
          jwtLogin(req, profile, done)
            .then(() => {
              expect(getUserByIdStub).to.have.been.calledOnce;
            })
            .catch(err => {
              // console.log('235');
              // console.log(err)
            })
            .finally(() => {
              sandbox.restore();
              return knexCleaner.clean(db);
            });
        })
      );
    });
  });
});
